import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import bridge from '@vkontakte/vk-bridge';
import type { AppDispatch, RootState } from '../index';
import { checkPinConditions } from './pinsSlice';

export interface CalendarActivity {
  id: string;
  type: 'tarot_reading' | 'affirmation' | 'other';
  title: string;
  summary: string;
  fullContent?: string; // Полная информация об активности
  timestamp: number;
}

export interface CalendarNote {
  id: string;
  content: string;
  timestamp: number;
}

export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  activities: CalendarActivity[];
  note?: CalendarNote;
}

interface CalendarState {
  daysData: Record<string, CalendarDayData>;
  selectedDate: string | null;
  loading: boolean;
  error: string | null;
  dataLoaded: boolean;
}

const initialState: CalendarState = {
  daysData: {},
  selectedDate: null,
  loading: false,
  error: null,
  dataLoaded: false,
};

const STORAGE_KEY = 'calendar_data';

// Кэш для данных календаря в памяти
let memoryCache: Record<string, CalendarDayData> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 секунд кэш

// Utility functions for storage
const isVKEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

const saveToStorage = async (data: Record<string, CalendarDayData>): Promise<void> => {
  try {
    // Обновляем кэш в памяти
    memoryCache = { ...data };
    cacheTimestamp = Date.now();
    
    if (isVKEnvironment()) {
      // VK Storage for production с timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage save timeout')), 3000)
      );
      
      const savePromise = bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify(data),
      });
      
      await Promise.race([savePromise, timeoutPromise]);
    } else {
      // localStorage for development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to save calendar data:', error);
    // Fallback к localStorage даже в VK среде
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Если и localStorage не работает, то просто логируем ошибку
      console.error('Failed to save to localStorage as well');
    }
  }
};

const loadFromStorage = async (): Promise<Record<string, CalendarDayData>> => {
  try {
    // Проверяем кэш в памяти
    const now = Date.now();
    if (memoryCache && (now - cacheTimestamp) < CACHE_TTL) {
      console.log('Используем данные из кэша памяти');
      return memoryCache;
    }
    
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
      const parsedData = data ? JSON.parse(data) : {};
      
      // Обновляем кэш
      memoryCache = parsedData;
      cacheTimestamp = now;
      
      return parsedData;
    } else {
      // localStorage for development
      const data = localStorage.getItem(STORAGE_KEY);
      const parsedData = data ? JSON.parse(data) : {};
      
      // Обновляем кэш
      memoryCache = parsedData;
      cacheTimestamp = now;
      
      return parsedData;
    }
  } catch (error) {
    console.error('Failed to load calendar data:', error);
    
    // Если есть кэш, используем его даже если он устарел
    if (memoryCache) {
      console.log('Используем устаревший кэш из-за ошибки загрузки');
      return memoryCache;
    }
    
    // Fallback к localStorage даже в VK среде
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsedData = data ? JSON.parse(data) : {};
      
      // Обновляем кэш
      memoryCache = parsedData;
      cacheTimestamp = Date.now();
      
      return parsedData;
    } catch {
      return {};
    }
  }
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setDaysData: (state, action: PayloadAction<Record<string, CalendarDayData>>) => {
      state.daysData = action.payload;
      state.dataLoaded = true;
    },
    addActivity: (state, action: PayloadAction<{ date: string; activity: CalendarActivity }>) => {
      const { date, activity } = action.payload;
      if (!state.daysData[date]) {
        state.daysData[date] = {
          date,
          activities: [],
        };
      }
      state.daysData[date].activities.push(activity);
    },
    updateNote: (state, action: PayloadAction<{ date: string; note: CalendarNote }>) => {
      const { date, note } = action.payload;
      if (!state.daysData[date]) {
        state.daysData[date] = {
          date,
          activities: [],
        };
      }
      state.daysData[date].note = note;
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      const date = action.payload;
      if (state.daysData[date]) {
        delete state.daysData[date].note;
      }
    },
    removeActivity: (state, action: PayloadAction<{ date: string; activityId: string }>) => {
      const { date, activityId } = action.payload;
      if (state.daysData[date]) {
        state.daysData[date].activities = state.daysData[date].activities.filter(
          activity => activity.id !== activityId
        );
        // Если больше нет активностей и заметок, удаляем весь день
        if (state.daysData[date].activities.length === 0 && !state.daysData[date].note) {
          delete state.daysData[date];
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSelectedDate,
  setDaysData,
  addActivity,
  updateNote,
  deleteNote,
  removeActivity,
} = calendarSlice.actions;

// Async thunks
export const loadCalendarData = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { calendar } = getState();
  
  // Если данные уже загружены, не загружаем повторно
  if (calendar.dataLoaded) {
    return;
  }
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const data = await loadFromStorage();
    dispatch(setDaysData(data));
  } catch (error) {
    dispatch(setError('Не удалось загрузить данные календаря'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const forceReloadCalendarData = () => async (dispatch: AppDispatch) => {
  // Очищаем кэш для принудительной перезагрузки
  memoryCache = null;
  cacheTimestamp = 0;
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const data = await loadFromStorage();
    dispatch(setDaysData(data));
  } catch (error) {
    dispatch(setError('Не удалось загрузить данные календаря'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveCalendarData = (data: Record<string, CalendarDayData>) => async (dispatch: AppDispatch) => {
  try {
    // Используем актуальные данные из кэша или текущего состояния
    const currentData = memoryCache || data;
    
    // Объединяем данные (приоритет у новых данных)
    const mergedData = { ...currentData, ...data };
    
    await saveToStorage(mergedData);
  } catch (error) {
    dispatch(setError('Не удалось сохранить данные календаря'));
  }
};

export const addCalendarActivity = (date: string, activity: CalendarActivity) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addActivity({ date, activity }));
  const { calendar } = getState();
  await dispatch(saveCalendarData(calendar.daysData));
};

export const updateCalendarNote = (date: string, note: CalendarNote) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(updateNote({ date, note }));
  const { calendar } = getState();
  await dispatch(saveCalendarData(calendar.daysData));
  
  // Проверяем условие для разблокировки пина "Хранитель Воспоминаний"
  dispatch(checkPinConditions({ type: 'calendar_note_added', data: note }));
};

export const deleteCalendarNote = (date: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(deleteNote(date));
  const { calendar } = getState();
  await dispatch(saveCalendarData(calendar.daysData));
};

export const removeCalendarActivity = (date: string, activityId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeActivity({ date, activityId }));
  const { calendar } = getState();
  await dispatch(saveCalendarData(calendar.daysData));
};

export default calendarSlice.reducer; 