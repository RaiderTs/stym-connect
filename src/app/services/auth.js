import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const rtkAuth = createApi({
  reducerPath: 'rtkAuth',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.stymconnect.com/auth/',
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = getState().auth.user?.token;
      if (token) {
        headers.set('authorization', `${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: 'registration',
        method: 'POST',
        body: credentials,
      }),
    }),
    // protected: builder.mutation({
    //   query: () => 'protected',
    // }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = rtkAuth;
