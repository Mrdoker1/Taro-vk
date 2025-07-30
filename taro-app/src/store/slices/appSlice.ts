import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import bridge from '../../bridge';

// Асинхронный action для загрузки вопроса из VK Storage
export const loadUserQuestion = createAsyncThunk(
  'app/loadUserQuestion',
  async () => {
    try {
      // Добавляем timeout для VK Bridge запросов
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage timeout')), 3000)
      );
      
      const storagePromise = bridge.send('VKWebAppStorageGet', {
        keys: ['userQuestion']
      });
      
      const result = await Promise.race([storagePromise, timeoutPromise]) as { keys: Array<{ key: string; value: string }> };
      
      if (result.keys && result.keys.length > 0 && result.keys[0].value) {
        return result.keys[0].value;
      }
      
      // Fallback к sessionStorage
      return sessionStorage.getItem('userQuestion') || '';
    } catch (error) {
      console.warn('Не удалось загрузить из VK Storage, используем sessionStorage:', error);
      // Fallback к sessionStorage
      try {
        return sessionStorage.getItem('userQuestion') || '';
      } catch {
        return '';
      }
    }
  }
);

// Функция для получения вопроса из VK Storage
const getUserQuestionFromStorage = (): string => {
  try {
    // Для VK Mini Apps используем sessionStorage как fallback
    // В реальном приложении данные будут загружаться через VKWebAppStorageGet
    return sessionStorage.getItem('userQuestion') || '';
  } catch {
    return '';
  }
};

// Функция для сохранения вопроса в VK Storage
const saveUserQuestionToStorage = async (question: string): Promise<void> => {
  try {
    if (question.trim()) {
      // Пытаемся сохранить через VK Bridge с timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage save timeout')), 3000)
      );
      
      const savePromise = bridge.send('VKWebAppStorageSet', {
        key: 'userQuestion',
        value: question
      });
      
      await Promise.race([savePromise, timeoutPromise]);
      // Также сохраняем в sessionStorage как fallback
      sessionStorage.setItem('userQuestion', question);
    } else {
      // Удаляем из VK Storage
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage delete timeout')), 3000)
      );
      
      const deletePromise = bridge.send('VKWebAppStorageSet', {
        key: 'userQuestion',
        value: ''
      });
      
      await Promise.race([deletePromise, timeoutPromise]);
      // Также удаляем из sessionStorage
      sessionStorage.removeItem('userQuestion');
    }
  } catch (error) {
    console.warn('Не удалось сохранить в VK Storage, используем sessionStorage:', error);
    // Fallback к sessionStorage
    try {
      if (question.trim()) {
        sessionStorage.setItem('userQuestion', question);
      } else {
        sessionStorage.removeItem('userQuestion');
      }
    } catch {
      // Игнорируем ошибки
    }
  }
};

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
  userQuestion: getUserQuestionFromStorage(),
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
      saveUserQuestionToStorage(action.payload);
    },
    clearUserQuestion: (state) => {
      state.userQuestion = '';
      saveUserQuestionToStorage('');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserQuestion.fulfilled, (state, action) => {
        state.userQuestion = action.payload;
      })
      .addCase(loadUserQuestion.rejected, () => {
        // В случае ошибки оставляем текущее значение
        console.warn('Не удалось загрузить вопрос пользователя');
      });
  },
});

export const { setLoading, setError, setUseManualCardSelection, setUserQuestion, clearUserQuestion } = appSlice.actions;
export default appSlice.reducer; 