import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import bridge from '@vkontakte/vk-bridge';
import type { AppDispatch, RootState } from '../index';

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
}

const initialState: CalendarState = {
  daysData: {},
  selectedDate: null,
  loading: false,
  error: null,
};

const STORAGE_KEY = 'calendar_data';

// Utility functions for storage
const isVKEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

const saveToStorage = async (data: Record<string, CalendarDayData>): Promise<void> => {
  try {
    if (isVKEnvironment()) {
      // VK Storage for production
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify(data),
      });
    } else {
      // localStorage for development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to save calendar data:', error);
    throw error;
  }
};

const loadFromStorage = async (): Promise<Record<string, CalendarDayData>> => {
  try {
    if (isVKEnvironment()) {
      // VK Storage for production
      const result = await bridge.send('VKWebAppStorageGet', {
        keys: [STORAGE_KEY],
      });
      const data = result.keys.find(item => item.key === STORAGE_KEY)?.value;
      return data ? JSON.parse(data) : {};
    } else {
      // localStorage for development
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    }
  } catch (error) {
    console.error('Failed to load calendar data:', error);
    return {};
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
export const loadCalendarData = () => async (dispatch: AppDispatch) => {
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
    await saveToStorage(data);
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