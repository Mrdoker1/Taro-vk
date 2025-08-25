import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import bridge from '../../bridge';
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

// Legacy single-key storage (dev/local)
const STORAGE_KEY = 'calendar_data';
// New VK storage scheme: small values per day + index
const VK_INDEX_KEY = 'calendar_index'; // JSON: { dates: string[] }
const VK_DAY_PREFIX = 'calendar_day_'; // + YYYY-MM-DD
const VK_NOTE_PREFIX = 'calendar_note_'; // + YYYY-MM-DD (note stored separately for reliability)

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
      // VK Storage: сохраняем покомпонентно по дням, чтобы не упереться в лимит размера значения.
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('VK Storage save timeout')), ms));

      // 1) Загружаем текущий индекс
      let currentIndex: { dates: string[] } = { dates: [] };
      try {
        const getIndexRes = await Promise.race([
          bridge.send('VKWebAppStorageGet', { keys: [VK_INDEX_KEY] }),
          timeout(3000),
        ]) as { keys: Array<{ key: string; value: string }> };
        const raw = getIndexRes.keys.find(k => k.key === VK_INDEX_KEY)?.value;
        if (raw) currentIndex = JSON.parse(raw);
      } catch (e) {
        // Нет индекса — создадим позже
      }

  const newDates = Object.keys(data);
  const oldDates = currentIndex.dates || [];

      // 2) Сохраняем все дни из входящих данных
      for (const date of newDates) {
        const dayData = data[date];
        const dayKey = VK_DAY_PREFIX + date;
        try {
          await Promise.race([
            bridge.send('VKWebAppStorageSet', {
              key: dayKey,
              value: JSON.stringify(dayData),
            }),
            timeout(3000),
          ]);
        } catch (e) {
          console.error('VK Storage: не удалось сохранить день', date, e);
          // Падать не будем — продолжим сохранять остальные дни
        }

        // Сохраняем заметку отдельно, чтобы она не терялась, если dayData слишком большой
        try {
          const noteKey = VK_NOTE_PREFIX + date;
          const noteValue = dayData.note ? JSON.stringify(dayData.note) : '';
          await Promise.race([
            bridge.send('VKWebAppStorageSet', {
              key: noteKey,
              value: noteValue,
            }),
            timeout(3000),
          ]);
        } catch (e) {
          console.warn('VK Storage: не удалось сохранить заметку за день', date, e);
        }
  }

  // 3) Больше не удаляем старые дни массово, чтобы избежать потери данных из-за пустой загрузки.

      // 4) Обновляем индекс дат безопасно (только если есть новые даты)
      try {
        if (newDates.length > 0) {
          const merged = Array.from(new Set([...(oldDates || []), ...newDates]));
          await Promise.race([
            bridge.send('VKWebAppStorageSet', {
              key: VK_INDEX_KEY,
              value: JSON.stringify({ dates: merged }),
            }),
            timeout(3000),
          ]);
        } else {
          // Пропускаем обновление индекса, чтобы не перезаписать его пустым значением при временных сбоях
        }
      } catch (e) {
        console.error('VK Storage: не удалось сохранить индекс календаря', e);
      }
      
      // Локальный зеркальный бэкап (на всякий случай)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
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
      // VK Storage: читаем индекс и подгружаем дни по отдельности. Таймаут 3 сек на каждую операцию.
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('VK Storage timeout')), ms));

      // 0) Попытка миграции со старого формата (single key) в новый
      try {
        const legacyRes = await Promise.race([
          bridge.send('VKWebAppStorageGet', { keys: [STORAGE_KEY] }),
          timeout(3000),
        ]) as { keys: Array<{ key: string; value: string }> };
        const legacyRaw = legacyRes.keys.find(k => k.key === STORAGE_KEY)?.value;
        if (legacyRaw) {
          const legacyData = JSON.parse(legacyRaw) as Record<string, CalendarDayData>;
          // Сохраняем в новом формате
          await saveToStorage(legacyData);
          // Очищаем legacy ключ (не обязательно, но чтобы не путало)
          try {
            await Promise.race([
              bridge.send('VKWebAppStorageSet', { key: STORAGE_KEY, value: '' }),
              timeout(3000),
            ]);
          } catch {
            // ignore
          }
        }
      } catch {
        // нет legacy — ок
      }

      // 1) Получаем индекс дат
      const getIndexRes = await Promise.race([
        bridge.send('VKWebAppStorageGet', { keys: [VK_INDEX_KEY] }),
        timeout(3000),
      ]) as { keys: Array<{ key: string; value: string }> };
      const indexRaw = getIndexRes.keys.find(k => k.key === VK_INDEX_KEY)?.value;
      const index: { dates: string[] } = indexRaw ? JSON.parse(indexRaw) : { dates: [] };

      // Если индекс пуст — пробуем восстановиться
      if (!index.dates || index.dates.length === 0) {
        // 1a) Пытаемся просканировать ключи VK Storage для восстановления
        const allKeys: string[] = [];
        try {
          const MAX = 100;
          for (let offset = 0; offset < 2000; offset += MAX) { // ограничимся 2000 для безопасности
            const res = await Promise.race([
              bridge.send('VKWebAppStorageGetKeys', { count: MAX, offset }),
              timeout(3000),
            ]) as { keys: string[] };
            if (!res || !res.keys || res.keys.length === 0) break;
            allKeys.push(...res.keys);
            if (res.keys.length < MAX) break;
          }
        } catch (e) {
          console.warn('VK Storage: не удалось получить список ключей', e);
        }

        const datesFromKeys = Array.from(new Set(
          allKeys
            .filter(k => k.startsWith(VK_DAY_PREFIX) || k.startsWith(VK_NOTE_PREFIX))
            .map(k => k.startsWith(VK_DAY_PREFIX) ? k.substring(VK_DAY_PREFIX.length) : k.substring(VK_NOTE_PREFIX.length))
        ));

        if (datesFromKeys.length > 0) {
          // Строим временный индекс и продолжаем обычную загрузку ниже на основе datesFromKeys
          const rebuiltIndex: { dates: string[] } = { dates: datesFromKeys };
          index.dates = rebuiltIndex.dates;
        } else {
          // 1b) Пытаемся локальный зеркальный бэкап
          try {
            const localRaw = localStorage.getItem(STORAGE_KEY);
            if (localRaw) {
              const parsedLocal = JSON.parse(localRaw) as Record<string, CalendarDayData>;
              memoryCache = parsedLocal;
              cacheTimestamp = now;
              return parsedLocal;
            }
          } catch {
            // ignore
          }
          memoryCache = {};
          cacheTimestamp = now;
          return {};
        }
      }

      // 2) Готовим список ключей и батч-запрос (с разбивкой по 100 ключей)
      const MAX_KEYS = 100;
      const chunk = <T,>(arr: T[], size: number) => {
        const res: T[][] = [];
        for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
        return res;
      };

      const dayKeys = index.dates.map(date => VK_DAY_PREFIX + date);
      const noteKeys = index.dates.map(date => VK_NOTE_PREFIX + date);

      const parsed: Record<string, CalendarDayData> = {};

      // Загружаем dayKeys порциями
      for (const part of chunk(dayKeys, MAX_KEYS)) {
        try {
          const partRes = await Promise.race([
            bridge.send('VKWebAppStorageGet', { keys: part }),
            timeout(3000),
          ]) as { keys: Array<{ key: string; value: string }> };
          for (const item of partRes.keys) {
            if (!item.value) continue;
            if (!item.key.startsWith(VK_DAY_PREFIX)) continue;
            const date = item.key.substring(VK_DAY_PREFIX.length);
            try {
              parsed[date] = JSON.parse(item.value);
            } catch (e) {
              console.warn('VK Storage: не удалось распарсить день', item.key, e);
            }
          }
        } catch (e) {
          console.warn('VK Storage: ошибка загрузки чанка дней', e);
        }
      }

      // Загружаем noteKeys порциями и мержим в parsed
      for (const part of chunk(noteKeys, MAX_KEYS)) {
        try {
          const partRes = await Promise.race([
            bridge.send('VKWebAppStorageGet', { keys: part }),
            timeout(3000),
          ]) as { keys: Array<{ key: string; value: string }> };
          for (const item of partRes.keys) {
            if (!item.value) continue;
            if (!item.key.startsWith(VK_NOTE_PREFIX)) continue;
            const date = item.key.substring(VK_NOTE_PREFIX.length);
            try {
              const note: CalendarNote = JSON.parse(item.value);
              if (!parsed[date]) {
                parsed[date] = { date, activities: [], note };
              } else {
                parsed[date].note = note;
              }
            } catch (e) {
              console.warn('VK Storage: не удалось распарсить заметку', item.key, e);
            }
          }
        } catch (e) {
          console.warn('VK Storage: ошибка загрузки чанка заметок', e);
        }
      }

      // Если по каким-то причинам ничего не загрузили, используем локальный бэкап
      if (Object.keys(parsed).length === 0) {
        try {
          const localRaw = localStorage.getItem(STORAGE_KEY);
          if (localRaw) {
            const parsedLocal = JSON.parse(localRaw) as Record<string, CalendarDayData>;
            memoryCache = parsedLocal;
            cacheTimestamp = now;
            return parsedLocal;
          }
        } catch {
          // ignore
        }
      }

      // Если по каким-то причинам ничего не загрузили, используем локальный бэкап
      if (Object.keys(parsed).length === 0) {
        try {
          const localRaw = localStorage.getItem(STORAGE_KEY);
          if (localRaw) {
            const parsedLocal = JSON.parse(localRaw) as Record<string, CalendarDayData>;
            memoryCache = parsedLocal;
            cacheTimestamp = now;
            return parsedLocal;
          }
        } catch {
          // ignore
        }
      }

      // Обновляем кэш и локальный зеркальный бэкап
      memoryCache = parsed;
      cacheTimestamp = now;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch { /* ignore */ }
      return parsed;
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

// Явное удаление пустого дня из VK Storage и индекса
export const deleteEmptyDay = (date: string) => async () => {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('VK Storage timeout')), ms));
  if (!isVKEnvironment()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) as Record<string, CalendarDayData> : {};
      delete data[date];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
    return;
  }
  try {
    // Чистим ключи дня и заметки
    await Promise.race([
      bridge.send('VKWebAppStorageSet', { key: VK_DAY_PREFIX + date, value: '' }),
      timeout(3000),
    ]);
    await Promise.race([
      bridge.send('VKWebAppStorageSet', { key: VK_NOTE_PREFIX + date, value: '' }),
      timeout(3000),
    ]);
    // Обновляем индекс: убираем дату
    const res = await Promise.race([
      bridge.send('VKWebAppStorageGet', { keys: [VK_INDEX_KEY] }),
      timeout(3000),
    ]) as { keys: Array<{ key: string; value: string }> };
    const idxRaw = res.keys.find(k => k.key === VK_INDEX_KEY)?.value;
    const idx: { dates: string[] } = idxRaw ? JSON.parse(idxRaw) : { dates: [] };
    const newIdx = { dates: (idx.dates || []).filter(d => d !== date) };
    await Promise.race([
      bridge.send('VKWebAppStorageSet', { key: VK_INDEX_KEY, value: JSON.stringify(newIdx) }),
      timeout(3000),
    ]);
  } catch (e) {
    console.warn('Не удалось удалить пустой день из VK Storage', e);
  }
};

export default calendarSlice.reducer; 