import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppLanguage, ApiType, getLanguageForApi } from '../../utils/languageUtils';

// Типы данных
export type TaroCard = {
  id: string;
  name: string;
  imageUrl: string;
  meaning: {
    upright: string;
    reversed: string;
  };
}

export interface TaroDeck {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  cardsCount: number;
  available: boolean;
  cards?: TaroCard[];
}

export interface TaroCardDetails {
  deck: {
    id: string;
    name: string;
    description: string;
  };
  card: TaroCard;
}

interface TaroDecksState {
  decks: TaroDeck[];
  currentDeck: TaroDeck | null;
  currentCard: TaroCardDetails | null;
  decksLoading: boolean;
  deckLoading: boolean;
  cardLoading: boolean;
  decksError: string | null;
  deckError: string | null;
  cardError: string | null;
}

const initialState: TaroDecksState = {
  decks: [],
  currentDeck: null,
  currentCard: null,
  decksLoading: false,
  deckLoading: false,
  cardLoading: false,
  decksError: null,
  deckError: null,
  cardError: null,
};

// Определяем URL API в зависимости от окружения
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://taro-d8jd.onrender.com';

// Асинхронные действия (thunks)
export const fetchDecks = createAsyncThunk(
  'taroDecks/fetchDecks',
  async ({ lang = 'russian' as AppLanguage }: { lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/decks?includeAll=false&lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении списка колод');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching decks:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить список колод');
    }
  }
);

export const fetchDeckDetails = createAsyncThunk(
  'taroDecks/fetchDeckDetails',
  async ({ deckId, lang = 'russian' as AppLanguage }: { deckId: string; lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/decks/${deckId}?includeAll=true&lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении информации о колоде');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching deck details:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить информацию о колоде');
    }
  }
);

export const fetchCardDetails = createAsyncThunk(
  'taroDecks/fetchCardDetails',
  async ({ deckId, cardId, lang = 'russian' as AppLanguage }: { deckId: string; cardId: string; lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}?lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении информации о карте');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching card details:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить информацию о карте');
    }
  }
);

// Создание слайса
const taroDecksSlice = createSlice({
  name: 'taroDecks',
  initialState,
  reducers: {
    clearCurrentDeck: (state) => {
      state.currentDeck = null;
      state.deckError = null;
    },
    clearCurrentCard: (state) => {
      state.currentCard = null;
      state.cardError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchDecks
      .addCase(fetchDecks.pending, (state) => {
        state.decksLoading = true;
        state.decksError = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action: PayloadAction<TaroDeck[]>) => {
        state.decksLoading = false;
        state.decks = action.payload;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.decksLoading = false;
        state.decksError = action.payload as string || 'Ошибка загрузки колод';
      })
      
      // Обработка fetchDeckDetails
      .addCase(fetchDeckDetails.pending, (state) => {
        state.deckLoading = true;
        state.deckError = null;
      })
      .addCase(fetchDeckDetails.fulfilled, (state, action: PayloadAction<TaroDeck>) => {
        state.deckLoading = false;
        state.currentDeck = action.payload;
      })
      .addCase(fetchDeckDetails.rejected, (state, action) => {
        state.deckLoading = false;
        state.deckError = action.payload as string || 'Ошибка загрузки колоды';
      })
      
      // Обработка fetchCardDetails
      .addCase(fetchCardDetails.pending, (state) => {
        state.cardLoading = true;
        state.cardError = null;
      })
      .addCase(fetchCardDetails.fulfilled, (state, action: PayloadAction<TaroCardDetails>) => {
        state.cardLoading = false;
        state.currentCard = action.payload;
      })
      .addCase(fetchCardDetails.rejected, (state, action) => {
        state.cardLoading = false;
        state.cardError = action.payload as string || 'Ошибка загрузки карты';
      });
  },
});

export const { clearCurrentDeck, clearCurrentCard } = taroDecksSlice.actions;
export default taroDecksSlice.reducer; 