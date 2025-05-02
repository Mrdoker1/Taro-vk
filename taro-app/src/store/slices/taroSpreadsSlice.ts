import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppLanguage, ApiType, getLanguageForApi } from '../../utils/languageUtils';

// Типы данных
export interface CardMeta {
  label: string;
}

export interface TaroSpread {
  id: string;
  name: string;
  description: string;
  available: boolean;
  paid: boolean;
}

export interface TaroSpreadDetails extends TaroSpread {
  questions: string[];
  cardsCount: number;
  grid: number[][];
  meta: Record<string, CardMeta>;
}

interface TaroSpreadsState {
  spreads: TaroSpread[];
  currentSpread: TaroSpreadDetails | null;
  spreadsLoading: boolean;
  spreadLoading: boolean;
  spreadsError: string | null;
  spreadError: string | null;
}

const initialState: TaroSpreadsState = {
  spreads: [],
  currentSpread: null,
  spreadsLoading: false,
  spreadLoading: false,
  spreadsError: null,
  spreadError: null,
};

// Определяем URL API в зависимости от окружения
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://taro-d8jd.onrender.com';

// Асинхронные действия (thunks)
export const fetchSpreads = createAsyncThunk(
  'taroSpreads/fetchSpreads',
  async ({ lang = 'russian' as AppLanguage }: { lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/spreads?includeAll=false&lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении списка раскладов');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spreads:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить список раскладов');
    }
  }
);

export const fetchSpreadDetails = createAsyncThunk(
  'taroSpreads/fetchSpreadDetails',
  async ({ spreadId, lang = 'russian' as AppLanguage }: { spreadId: string; lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/spreads/${spreadId}?includeAll=true&lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении информации о раскладе');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spread details:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить информацию о раскладе');
    }
  }
);

// Создание слайса
const taroSpreadsSlice = createSlice({
  name: 'taroSpreads',
  initialState,
  reducers: {
    clearCurrentSpread: (state) => {
      state.currentSpread = null;
      state.spreadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchSpreads
      .addCase(fetchSpreads.pending, (state) => {
        state.spreadsLoading = true;
        state.spreadsError = null;
      })
      .addCase(fetchSpreads.fulfilled, (state, action: PayloadAction<TaroSpread[]>) => {
        state.spreadsLoading = false;
        state.spreads = action.payload;
      })
      .addCase(fetchSpreads.rejected, (state, action) => {
        state.spreadsLoading = false;
        state.spreadsError = action.payload as string || 'Ошибка загрузки раскладов';
      })
      
      // Обработка fetchSpreadDetails
      .addCase(fetchSpreadDetails.pending, (state) => {
        state.spreadLoading = true;
        state.spreadError = null;
      })
      .addCase(fetchSpreadDetails.fulfilled, (state, action: PayloadAction<TaroSpreadDetails>) => {
        state.spreadLoading = false;
        state.currentSpread = action.payload;
      })
      .addCase(fetchSpreadDetails.rejected, (state, action) => {
        state.spreadLoading = false;
        state.spreadError = action.payload as string || 'Ошибка загрузки расклада';
      });
  },
});

export const { clearCurrentSpread } = taroSpreadsSlice.actions;
export default taroSpreadsSlice.reducer; 