import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { PURGE } from 'redux-persist';
import { useRouter } from 'next/router';

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

//* Google Sign in

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const googleSignIn = createAsyncThunk(
  'google/signin',
  async (req, thunkAPI) => {
    try {
      const auth = getAuth();
      const response = await signInWithPopup(auth, provider);
      const body = {
        uid: response.user.uid,
      };

      const token = await fetch('https://api.stymconnect.com/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const tokenRes = await token.json();

      const decodedUser = await authService.base64decode(tokenRes.token);

      const userData = {
        ...response.user.providerData[0],
        ...tokenRes,
        ...decodedUser,
      };
      return userData;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const googleSignout = createAsyncThunk(
  'google/signout',
  async (_, thunkAPI) => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (user, thunkAPI) => {
    // This user is coming from the form !!!
    console.log(user, 'user from auth slice');
    try {
      await fetch('https://api.stymconnect.com/auth/registration', {
        method: 'POST', // or 'PUT'
        body: user,
      });
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// api login user
export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
  try {
    // console.log(user, 'user');
    const response = await fetch('https://api.stymconnect.com/auth/login', {
      method: 'POST',
      body: user,
    });

    if (response.status === 401) {
      return thunkAPI.rejectWithValue('Invalid email or password');
    } else if (response.status === 404) {
      return thunkAPI.rejectWithValue('User not found');
    }

    const data = await response.json();
    // console.log(data, 'data from auth slice');
    const decodedUser = await authService.base64decode(data.token);
    const processedUser = { ...data, ...decodedUser };
    return processedUser;
  } catch (error) {
    const message = error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCredentials: (state, action) => {
      state.user = action.payload;
    },
    updateToken: (state, action) => {
      state.user.token = action.payload.token;
      state.user.tariff = action.payload.tariff;
    },
    logout: (state) => {
      state.user = initialState.user;
      state.isLoading = false;
      state.isError = null;
      state.isSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // GOOGLE AUTH
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isError = null;
        state.isSuccess = null;
      })
      .addCase(googleSignIn.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isError = action.payload;
      })
      .addCase(googleSignout.fulfilled, (state) => {
        state.user = initialState.user;
        state.isLoading = false;
        state.isError = null;
        state.isSuccess = null;
      })
      .addCase(googleSignout.rejected, (state, action) => {
        state.isError = action.payload;
      });
    // .addCase(updateToken.pending, (state, action) => {
    //   state.isLoading = true;
    // })
    // .addCase(updateToken.rejected, (state, action) => {
    //   state.isError = action.payload;
    // })
    // .addCase(updateToken.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.user.token = action.payload;
    // });
  },
});

export const { reset, setCredentials, updateToken, logout } = authSlice.actions;
export default authSlice.reducer;
