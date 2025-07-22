import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  error: string | null;
  useManualCardSelection: boolean;
  userQuestion: string;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  useManualCardSelection: false,
  userQuestion: '',
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
    setUserQuestion: (state, action: PayloadAction<string>) => {
      state.userQuestion = action.payload;
    },
  },
});

export const { setLoading, setError, setUseManualCardSelection, setUserQuestion } = appSlice.actions;
export default appSlice.reducer; 