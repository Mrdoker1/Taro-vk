import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppLanguage, ApiType, getLanguageForApi } from '../../utils/languageUtils';
import bridge from '@vkontakte/vk-bridge';

// Кеширование колод с использованием VK Storage API
const DECKS_CACHE_KEY = 'taro_decks_cache';
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 минут

interface CachedDecks {
  data: TaroDeck[];
  timestamp: number;
  lang: string;
}

// Загрузка кешированных колод из VK Storage с fallback на sessionStorage
const loadCachedDecks = async (lang: string): Promise<TaroDeck[] | null> => {
  try {
    let cached: string | null = null;
    
    try {
      // Пытаемся загрузить из VK Storage
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage timeout')), 3000)
      );
      
      const storagePromise = bridge.send('VKWebAppStorageGet', {
        keys: [DECKS_CACHE_KEY]
      });
      
      const result = await Promise.race([storagePromise, timeoutPromise]) as { keys: Array<{ key: string; value: string }> };
      
      if (result.keys && result.keys.length > 0) {
        cached = result.keys[0].value || null;
      }
    } catch (error) {
      // В dev версии VK Storage может не работать - это нормально
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDev) {
        console.log('VK Storage недоступен в dev режиме, используем sessionStorage');
      } else {
        console.warn('Не удалось загрузить из VK Storage, используем sessionStorage:', error);
      }
      // Fallback к sessionStorage
      cached = sessionStorage.getItem(DECKS_CACHE_KEY);
    }

    if (!cached) return null;

    const cachedData: CachedDecks = JSON.parse(cached);
    const now = Date.now();
    
    // Проверяем актуальность кеша и соответствие языка
    if (cachedData.lang === lang && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
      return cachedData.data;
    }
    
    // Кеш устарел или не подходит по языку
    return null;
  } catch (error) {
    console.error('Ошибка загрузки кеша колод:', error);
    return null;
  }
};

// Сохранение колод в VK Storage с fallback на sessionStorage
const saveCachedDecks = async (decks: TaroDeck[], lang: string): Promise<void> => {
  try {
    const cacheData: CachedDecks = {
      data: decks,
      timestamp: Date.now(),
      lang
    };
    const cacheString = JSON.stringify(cacheData);
    
    try {
      // Пытаемся сохранить в VK Storage
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage save timeout')), 3000)
      );
      
      const savePromise = bridge.send('VKWebAppStorageSet', {
        key: DECKS_CACHE_KEY,
        value: cacheString
      });
      
      await Promise.race([savePromise, timeoutPromise]);
      // Также сохраняем в sessionStorage как fallback
      sessionStorage.setItem(DECKS_CACHE_KEY, cacheString);
    } catch (error) {
      // В dev версии VK Storage может не работать - это нормально
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDev) {
        console.log('VK Storage недоступен в dev режиме, используем sessionStorage');
      } else {
        console.warn('Не удалось сохранить в VK Storage, используем sessionStorage:', error);
      }
      // Fallback к sessionStorage
      sessionStorage.setItem(DECKS_CACHE_KEY, cacheString);
    }
  } catch (error) {
    console.error('Ошибка сохранения кеша колод:', error);
  }
};

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
      // Сначала пытаемся загрузить из кеша
      const cachedDecks = await loadCachedDecks(lang);
      if (cachedDecks) {
        return cachedDecks;
      }

      // Если кеша нет или он устарел, делаем запрос к API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      const response = await fetch(`${API_URL}/decks?includeAll=false&lang=${apiLang}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении списка колод');
      }
      
      const data = await response.json();
      
      // Сохраняем полученные данные в кеш (не ждем завершения)
      saveCachedDecks(data, lang).catch(error => {
        console.warn('Не удалось сохранить кеш колод:', error);
      });
      
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