import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API } from '../../constants/api';
import { AppLanguage, ApiType, getLanguageForApi } from '../../utils/languageUtils';
import bridge from '../../bridge';

type HoroscopeType = 'daily' | 'weekly' | 'monthly';
type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
type DayType = 'TODAY' | 'TOMORROW' | 'YESTERDAY' | string;

interface HoroscopeResponse {
  sign: ZodiacSign;
  date?: string;
  week?: string;
  month?: string;
  prediction: string;
  mood: string;
  color: string;
  number: number;
}

interface HoroscopeState {
  sign: ZodiacSign;
  type: HoroscopeType;
  day: DayType;
  lang: AppLanguage;
  horoscope: HoroscopeResponse | null;
  loading: boolean;
  error: string | null;
}

// --- Persistence helpers for zodiac sign ---
const ZODIAC_STORAGE_KEY = 'userZodiacSign';

const isValidZodiacSign = (val: string): val is ZodiacSign => (
  [
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
  ] as const
).includes(val as ZodiacSign);

// Quick fallback read to avoid UI flicker before async load
const getZodiacSignFromFallback = (): ZodiacSign => {
  try {
    const stored = sessionStorage.getItem(ZODIAC_STORAGE_KEY) || localStorage.getItem(ZODIAC_STORAGE_KEY);
    if (stored && isValidZodiacSign(stored)) return stored;
  } catch {
    // ignore
  }
  return 'Aries';
};

// Save selected sign into VK Storage with timeouts + fallback mirrors
const saveZodiacSignToStorage = async (sign: ZodiacSign): Promise<void> => {
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('VK Storage save timeout')), 3000));
    const vkSave = bridge.send('VKWebAppStorageSet', { key: ZODIAC_STORAGE_KEY, value: sign });
    await Promise.race([vkSave, timeout]);
  try { sessionStorage.setItem(ZODIAC_STORAGE_KEY, sign); } catch { /* ignore */ }
  try { localStorage.setItem(ZODIAC_STORAGE_KEY, sign); } catch { /* ignore */ }
  } catch {
  try { sessionStorage.setItem(ZODIAC_STORAGE_KEY, sign); } catch { /* ignore */ }
  try { localStorage.setItem(ZODIAC_STORAGE_KEY, sign); } catch { /* ignore */ }
  }
};

// Thunk to load sign from VK Storage at startup
export const loadZodiacSign = createAsyncThunk(
  'horoscope/loadZodiacSign',
  async () => {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('VK Storage timeout')), 3000));
      const vkGet = bridge.send('VKWebAppStorageGet', { keys: [ZODIAC_STORAGE_KEY] });
      const result = await Promise.race([vkGet, timeout]) as { keys: Array<{ key: string; value: string }>} ;
      const raw = result?.keys?.[0]?.value;
      if (raw && isValidZodiacSign(raw)) {
  try { sessionStorage.setItem(ZODIAC_STORAGE_KEY, raw); } catch { /* ignore */ }
  try { localStorage.setItem(ZODIAC_STORAGE_KEY, raw); } catch { /* ignore */ }
        return raw as ZodiacSign;
      }
      return null;
    } catch {
      return null;
    }
  }
);

const initialState: HoroscopeState = {
  sign: getZodiacSignFromFallback(),
  type: 'daily',
  day: 'TODAY',
  lang: 'russian',
  horoscope: null,
  loading: false,
  error: null,
};

export const fetchHoroscope = createAsyncThunk(
  'horoscope/fetchHoroscope',
  async ({ sign, type, day = 'TODAY', lang = 'russian' as AppLanguage }: { 
    sign: ZodiacSign; 
    type: HoroscopeType;
    day?: DayType;
    lang?: AppLanguage;
  }, { rejectWithValue }) => {
    try {
      // Получаем язык в формате, нужном для API гороскопов
      const apiLang = getLanguageForApi(lang, ApiType.HOROSCOPE);
      
      const params = new URLSearchParams({
        sign,
        lang: apiLang,
        ...(type === 'daily' && { day }),
      });

      const response = await fetch(API.horoscope(type, params.toString()));
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов. Пожалуйста, попробуйте позже.');
        }
        
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении гороскопа');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить гороскоп. Пожалуйста, попробуйте позже.');
    }
  }
);

const horoscopeSlice = createSlice({
  name: 'horoscope',
  initialState,
  reducers: {
    setSign: (state, action: PayloadAction<ZodiacSign>) => {
      state.sign = action.payload;
      // persist (fire-and-forget)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      saveZodiacSignToStorage(action.payload);
    },
    setType: (state, action: PayloadAction<HoroscopeType>) => {
      state.type = action.payload;
    },
    setDay: (state, action: PayloadAction<DayType>) => {
      state.day = action.payload;
    },
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.lang = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadZodiacSign.fulfilled, (state, action) => {
        if (action.payload && isValidZodiacSign(action.payload)) {
          state.sign = action.payload;
        }
      })
      .addCase(fetchHoroscope.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoroscope.fulfilled, (state, action) => {
        state.loading = false;
        state.horoscope = action.payload;
      })
      .addCase(fetchHoroscope.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Произошла ошибка при получении гороскопа';
      });
  },
});

export const { setSign, setType, setDay, setLanguage } = horoscopeSlice.actions;
export default horoscopeSlice.reducer; 