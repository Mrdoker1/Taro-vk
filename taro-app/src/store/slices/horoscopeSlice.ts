import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

type HoroscopeType = 'daily' | 'weekly' | 'monthly';
type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
type DayType = 'TODAY' | 'TOMORROW' | 'YESTERDAY' | string;
type Language = 'russian' | 'english';

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
  lang: Language;
  horoscope: HoroscopeResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: HoroscopeState = {
  sign: 'Aries',
  type: 'daily',
  day: 'TODAY',
  lang: 'russian',
  horoscope: null,
  loading: false,
  error: null,
};

const API_URL = 'https://taro-d8jd.onrender.com';

export const fetchHoroscope = createAsyncThunk(
  'horoscope/fetchHoroscope',
  async ({ sign, type, day = 'TODAY', lang = 'russian' }: { 
    sign: ZodiacSign; 
    type: HoroscopeType;
    day?: DayType;
    lang?: Language;
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        sign,
        lang,
        ...(type === 'daily' && { day }),
      });

      const response = await fetch(`${API_URL}/horoscope/${type}?${params}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов. Пожалуйста, попробуйте позже.');
        }
        throw new Error('Ошибка при получении гороскопа');
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
    },
    setType: (state, action: PayloadAction<HoroscopeType>) => {
      state.type = action.payload;
    },
    setDay: (state, action: PayloadAction<DayType>) => {
      state.day = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.lang = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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