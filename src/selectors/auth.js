import { createSelector } from 'reselect';
import { store } from '../app/store';
import { AuthState } from '../features/auth/authSlice';

export const authSelector = (state) => state.auth;

export const userSelector = createSelector(authSelector, (auth) => {
  return auth.user;
});

export const errorSelector = createSelector(authSelector, (auth) => {
  return auth.error;
});
