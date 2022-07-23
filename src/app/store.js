import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import audioReducer from '../features/audio/audioSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { stymApi } from '../features/stymQuery';
import { rtkAuth } from './services/auth';
import modalSlice from '../features/modalSlice';
import fileCounterSlice from '../features/fileCounterSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  audio: audioReducer,
  modal: modalSlice,
  fileCounter: fileCounterSlice,
  [rtkAuth.reducerPath]: rtkAuth.reducer,
  [stymApi.reducerPath]: stymApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(stymApi.middleware, rtkAuth.middleware),
});

export const persistor = persistStore(store);
export default store;
