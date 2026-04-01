import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchApplicants = createAsyncThunk(
  'applicants/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/applicants', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const createApplicant = createAsyncThunk(
  'applicants/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/applicants', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateApplicant = createAsyncThunk(
  'applicants/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/applicants/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteApplicant = createAsyncThunk(
  'applicants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/applicants/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const applicantSlice = createSlice({
  name: 'applicants',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicants.pending, (state) => { state.loading = true; })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createApplicant.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateApplicant.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteApplicant.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      });
  },
});

export default applicantSlice.reducer;
