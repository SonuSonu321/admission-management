import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import applicantReducer from './slices/applicantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applicants: applicantReducer,
  },
});
