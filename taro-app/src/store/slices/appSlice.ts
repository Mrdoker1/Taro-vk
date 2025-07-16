import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  error: string | null;
  useManualCardSelection: boolean;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  useManualCardSelection: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUseManualCardSelection: (state, action: PayloadAction<boolean>) => {
      state.useManualCardSelection = action.payload;
    },
  },
});

export const { setLoading, setError, setUseManualCardSelection } = appSlice.actions;
export default appSlice.reducer; 