import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import bridge from '@vkontakte/vk-bridge';
import type { AppDispatch, RootState } from '../index';

interface StarsState {
  count: number;
  loading: boolean;
  error: string | null;
  showPurchasePopup: boolean;
}

const STORAGE_KEY = 'user_stars';

// Utility functions for storage
const isVKEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

const saveToStorage = async (count: number): Promise<void> => {
  try {
    if (isVKEnvironment()) {
      // VK Storage for production с timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage save timeout')), 3000)
      );
      
      const savePromise = bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: count.toString(),
      });
      
      await Promise.race([savePromise, timeoutPromise]);
    } else {
      // localStorage for development
      localStorage.setItem(STORAGE_KEY, count.toString());
    }
  } catch (error) {
    console.error('Failed to save stars count:', error);
    // Fallback к localStorage даже в VK среде
    try {
      localStorage.setItem(STORAGE_KEY, count.toString());
    } catch {
      console.error('Failed to save stars to localStorage as well');
    }
  }
};

const loadFromStorage = async (): Promise<number> => {
  try {
    if (isVKEnvironment()) {
      // VK Storage for production с timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage timeout')), 3000)
      );
      
      const storagePromise = bridge.send('VKWebAppStorageGet', {
        keys: [STORAGE_KEY],
      });
      
      const result = await Promise.race([storagePromise, timeoutPromise]) as { keys: Array<{ key: string; value: string }> };
      const data = result.keys.find(item => item.key === STORAGE_KEY)?.value;
      
      return data ? parseInt(data, 10) : 5; // Начальное количество звезд
    } else {
      // localStorage for development
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? parseInt(data, 10) : 5; // Начальное количество звезд
    }
  } catch (error) {
    console.error('Failed to load stars count:', error);
    // Fallback к localStorage даже в VK среде
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? parseInt(data, 10) : 5;
    } catch {
      return 5; // Дефолтное количество звезд
    }
  }
};

// Интерфейс для данных пакета звёзд
interface StarPackageData {
  id: string;
  stars: number;
  votes: number;
  bonus?: number;
}

// Асинхронная функция для покупки звёзд через VK Mini Apps
export const purchaseStars = createAsyncThunk<
  { success: boolean; starsAdded: number; message: string },
  StarPackageData,
  { dispatch: AppDispatch; state: RootState }
>(
  'stars/purchase',
  async (packageData: StarPackageData, { dispatch, rejectWithValue }) => {
    try {
      // Вызываем VK Bridge для покупки за голоса
      const result = await bridge.send('VKWebAppShowOrderBox', {
        type: 'item',
        item: `stars_${packageData.id}`,
      });

      console.log('Результат покупки от VK:', result);

      // Если покупка успешна, добавляем звёзды
      // В VK Mini Apps API успешная покупка возвращает объект без ошибки
      const totalStars = packageData.stars + (packageData.bonus || 0);
      
      // Добавляем звёзды в store
      dispatch(addStars(totalStars));
      
      return {
        success: true,
        starsAdded: totalStars,
        message: `Успешно добавлено ${totalStars} звёзд!`
      };
    } catch (error: unknown) {
      console.error('Ошибка при покупке звёзд:', error);
      
      // Обрабатываем различные типы ошибок VK
      const errorObj = error as { error_data?: { error_reason?: string }; message?: string };
      if (errorObj?.error_data?.error_reason === 'user_denied') {
        return rejectWithValue('Покупка была отменена пользователем');
      } else if (errorObj?.error_data?.error_reason === 'insufficient_funds') {
        return rejectWithValue('Недостаточно голосов для покупки');
      } else {
        return rejectWithValue(errorObj?.message || 'Произошла ошибка при покупке');
      }
    }
  }
);

const initialState: StarsState = {
  count: 5, // Начальное количество, будет загружено асинхронно
  loading: false,
  error: null,
  showPurchasePopup: false,
};

const starsSlice = createSlice({
  name: 'stars',
  initialState,
  reducers: {
    setStarsCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    
    spendStar: (state) => {
      if (state.count > 0) {
        state.count -= 1;
        // Сохраняем асинхронно
        saveToStorage(state.count).catch(console.error);
      }
    },
    
    addStars: (state, action: PayloadAction<number>) => {
      state.count += action.payload;
      // Сохраняем асинхронно
      saveToStorage(state.count).catch(console.error);
    },
    
    showPurchasePopup: (state) => {
      state.showPurchasePopup = true;
    },
    
    hidePurchasePopup: (state) => {
      state.showPurchasePopup = false;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseStars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseStars.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Звёзды уже добавлены в addStars action внутри thunk
      })
      .addCase(purchaseStars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Асинхронное действие для инициализации звезд
export const initializeStars = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const count = await loadFromStorage();
    dispatch(setStarsCount(count));
  } catch (error) {
    console.error('Failed to initialize stars:', error);
    dispatch(setError('Не удалось загрузить количество звезд'));
    dispatch(setStarsCount(100)); // Дефолтное значение
  } finally {
    dispatch(setLoading(false));
  }
};

// Действие для попытки потратить звезду с проверкой
export const trySpendStar = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { stars } = getState();
  
  if (stars.count <= 0) {
    dispatch(showPurchasePopup());
    return false;
  }
  
  dispatch(spendStar());
  return true;
};

export const {
  setStarsCount,
  spendStar,
  addStars,
  showPurchasePopup,
  hidePurchasePopup,
  setLoading,
  setError,
} = starsSlice.actions;

export default starsSlice.reducer;
