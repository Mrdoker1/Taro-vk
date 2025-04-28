import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

type HoroscopeType = 'daily' | 'weekly' | 'monthly';

interface HoroscopeState {
  sign: string;
  type: HoroscopeType;
  dailyHoroscope: {
    date: string;
    horoscope: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: HoroscopeState = {
  sign: 'Aries',
  type: 'daily',
  dailyHoroscope: null,
  loading: false,
  error: null,
};

// Моковые данные для заглушки
const mockHoroscopes = {
  daily: {
    date: new Date().toLocaleDateString('ru-RU'),
    horoscope: 'Сегодня вас ждут приятные сюрпризы. Будьте открыты новым возможностям и не бойтесь перемен. Звезды благосклонны к вам, особенно в сфере личных отношений.',
  },
  weekly: {
    date: `${new Date().toLocaleDateString('ru-RU')} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}`,
    horoscope: 'На этой неделе вас ждет период активного роста и развития. Сосредоточьтесь на своих целях и не отвлекайтесь на мелочи. В середине недели возможны неожиданные повороты событий.',
  },
  monthly: {
    date: `${new Date().toLocaleDateString('ru-RU')} - ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}`,
    horoscope: 'Этот месяц принесет значительные изменения в вашей жизни. Будьте готовы к новым вызовам и возможностям. Особое внимание уделите карьерному росту и личностному развитию.',
  },
};

export const fetchHoroscope = createAsyncThunk(
  'horoscope/fetchHoroscope',
  async ({ sign, type }: { sign: string; type: HoroscopeType }, { rejectWithValue }) => {
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Возвращаем моковые данные
      return mockHoroscopes[type];
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      return rejectWithValue('Не удалось получить гороскоп. Пожалуйста, попробуйте позже.');
    }
  }
);

const horoscopeSlice = createSlice({
  name: 'horoscope',
  initialState,
  reducers: {
    setSign: (state, action: PayloadAction<string>) => {
      state.sign = action.payload;
    },
    setType: (state, action: PayloadAction<HoroscopeType>) => {
      state.type = action.payload;
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
        state.dailyHoroscope = {
          date: action.payload.date,
          horoscope: action.payload.horoscope,
        };
      })
      .addCase(fetchHoroscope.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Произошла ошибка при получении гороскопа';
      });
  },
});

export const { setSign, setType } = horoscopeSlice.actions;
export default horoscopeSlice.reducer; 