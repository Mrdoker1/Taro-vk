import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import bridge from '@vkontakte/vk-bridge';
import type { AppDispatch } from '../index';

export interface Pin {
  id: string;
  name: string;
  description: string;
  requirement: string;
  image: string;
  isUnlocked: boolean;
  unlockedAt?: string; // дата разблокировки
  requiredCount?: number; // сколько действий нужно для разблокировки
  currentCount?: number; // сколько действий уже выполнено
}

export interface PinNotification {
  pin: Pin;
  isVisible: boolean;
}

interface PinsState {
  pins: Pin[];
  notification: PinNotification | null;
}

const STORAGE_KEY = 'taro_pins';

const initialPins: Pin[] = [
  {
    id: 'affirmation',
    name: 'Мастер Аффирмаций',
    description: 'Путь к позитивному мышлению через практику аффирмаций',
    requirement: 'Создайте 15 позитивных аффирмаций',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
    requiredCount: 15,
    currentCount: 0,
  },
  {
    id: 'calendar',
    name: 'Хранитель Воспоминаний',
    description: 'Мастер ведения дневника и рефлексии',
    requirement: 'Добавьте 15 записей в календарь',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
    requiredCount: 15,
    currentCount: 0,
  },
  {
    id: 'spreads',
    name: 'Ученик Таро',
    description: 'Начинающий исследователь мудрости карт',
    requirement: 'Выполните 3 магических расклада',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
    requiredCount: 3,
    currentCount: 0,
  },
  // Закомментировано для бесплатной версии
  // {
  //   id: 'star',
  //   name: 'Коллекционер Звезд',
  //   description: 'Мастерство накопления и обмена энергии',
  //   requirement: 'Обменяйте голоса на звезды',
  //   image: '', // будет заполнено в компоненте
  //   isUnlocked: false,
  //   requiredCount: 1,
  //   currentCount: 0,
  // },
];

// Utility functions for storage
const isVKEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

const saveToStorage = async (pins: Pin[]): Promise<void> => {
  try {
    if (isVKEnvironment()) {
      // VK Storage for production с timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VK Storage save timeout')), 3000)
      );
      
      const savePromise = bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify(pins),
      });
      
      await Promise.race([savePromise, timeoutPromise]);
    } else {
      // localStorage for development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    }
  } catch (error) {
    console.error('Failed to save pins data:', error);
    // Fallback к localStorage даже в VK среде
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    } catch {
      // Если и localStorage не работает, то просто логируем ошибку
      console.error('Failed to save pins to localStorage as well');
    }
  }
};

const loadFromStorage = async (): Promise<Pin[]> => {
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
      
      if (data) {
        const parsedPins = JSON.parse(data) as Pin[];
        return migratePinsData(parsedPins);
      }
      return initialPins;
    } else {
      // localStorage for development
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedPins = JSON.parse(data) as Pin[];
        return migratePinsData(parsedPins);
      }
      return initialPins;
    }
  } catch (error) {
    console.error('Failed to load pins data:', error);
    // Fallback к localStorage даже в VK среде
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedPins = JSON.parse(data) as Pin[];
        return migratePinsData(parsedPins);
      }
      return initialPins;
    } catch {
      return initialPins;
    }
  }
};

// Миграция данных пинов
const migratePinsData = (savedPins: Pin[]): Pin[] => {
  // Объединяем сохраненные данные с базовой структурой
  const mergedPins = initialPins.map(initialPin => {
    const savedPin = savedPins.find(p => p.id === initialPin.id);
    if (savedPin) {
      // Миграция старых данных - добавляем новые поля если их нет
      // Всегда используем актуальные тексты из initialPins
      return {
        ...initialPin, // берем все актуальные поля (name, description, requirement)
        isUnlocked: savedPin.isUnlocked ?? false,
        unlockedAt: savedPin.unlockedAt,
        currentCount: savedPin.currentCount ?? initialPin.currentCount ?? 0,
      };
    }
    return initialPin;
  });
  
  // Добавляем новые пины, которых нет в сохраненных данных
  const newPins = initialPins.filter(initialPin => 
    !savedPins.some(savedPin => savedPin.id === initialPin.id)
  );
  
  return [...mergedPins.filter(pin => savedPins.some(saved => saved.id === pin.id)), ...newPins];
};

const initialState: PinsState = {
  pins: initialPins, // Загрузка будет происходить асинхронно
  notification: null,
};

const pinsSlice = createSlice({
  name: 'pins',
  initialState,
  reducers: {
    unlockPin: (state, action: PayloadAction<string>) => {
      const pinId = action.payload;
      const pin = state.pins.find(p => p.id === pinId);
      
      if (pin && !pin.isUnlocked) {
        pin.isUnlocked = true;
        pin.unlockedAt = new Date().toISOString();
        
        // Сохраняем асинхронно
        saveToStorage(state.pins).catch(console.error);
        
        // Показываем уведомление о разблокировке
        state.notification = {
          pin: { ...pin },
          isVisible: true,
        };
      }
    },
    
    hideNotification: (state) => {
      if (state.notification) {
        state.notification.isVisible = false;
      }
    },
    
    clearNotification: (state) => {
      state.notification = null;
    },
    
    // Проверка условий для разблокировки пинов
    checkPinConditions: (state, action: PayloadAction<{
      type: 'affirmation_created' | 'calendar_note_added' | 'tarot_reading_completed' | 'stars_purchased';
      data?: unknown;
    }>) => {
      const { type } = action.payload;
      
      switch (type) {
        case 'affirmation_created': {
          const affirmationPin = state.pins.find(p => p.id === 'affirmation');
          if (affirmationPin && !affirmationPin.isUnlocked) {
            // Увеличиваем счетчик
            affirmationPin.currentCount = (affirmationPin.currentCount ?? 0) + 1;
            
            // Проверяем, достигнуто ли требуемое количество
            if (affirmationPin.currentCount >= (affirmationPin.requiredCount ?? 1)) {
              affirmationPin.isUnlocked = true;
              affirmationPin.unlockedAt = new Date().toISOString();
              
              state.notification = {
                pin: { ...affirmationPin },
                isVisible: true,
              };
            }
            
            // Сохраняем асинхронно
            saveToStorage(state.pins).catch(console.error);
          }
          break;
        }
          
        case 'calendar_note_added': {
          const calendarPin = state.pins.find(p => p.id === 'calendar');
          if (calendarPin && !calendarPin.isUnlocked) {
            // Увеличиваем счетчик
            calendarPin.currentCount = (calendarPin.currentCount ?? 0) + 1;
            
            // Проверяем, достигнуто ли требуемое количество
            if (calendarPin.currentCount >= (calendarPin.requiredCount ?? 1)) {
              calendarPin.isUnlocked = true;
              calendarPin.unlockedAt = new Date().toISOString();
              
              state.notification = {
                pin: { ...calendarPin },
                isVisible: true,
              };
            }
            
            // Сохраняем асинхронно
            saveToStorage(state.pins).catch(console.error);
          }
          break;
        }
          
        case 'tarot_reading_completed': {
          const spreadsPin = state.pins.find(p => p.id === 'spreads');
          if (spreadsPin && !spreadsPin.isUnlocked) {
            // Увеличиваем счетчик
            spreadsPin.currentCount = (spreadsPin.currentCount ?? 0) + 1;
            
            // Проверяем, достигнуто ли требуемое количество
            if (spreadsPin.currentCount >= (spreadsPin.requiredCount ?? 1)) {
              spreadsPin.isUnlocked = true;
              spreadsPin.unlockedAt = new Date().toISOString();
              
              state.notification = {
                pin: { ...spreadsPin },
                isVisible: true,
              };
            }
            
            // Сохраняем асинхронно
            saveToStorage(state.pins).catch(console.error);
          }
          break;
        }
        
        case 'stars_purchased': {
          const starPin = state.pins.find(p => p.id === 'star');
          if (starPin && !starPin.isUnlocked) {
            // Увеличиваем счетчик
            starPin.currentCount = (starPin.currentCount ?? 0) + 1;
            
            // Проверяем, достигнуто ли требуемое количество
            if (starPin.currentCount >= (starPin.requiredCount ?? 1)) {
              starPin.isUnlocked = true;
              starPin.unlockedAt = new Date().toISOString();
              
              state.notification = {
                pin: { ...starPin },
                isVisible: true,
              };
            }
            
            // Сохраняем асинхронно
            saveToStorage(state.pins).catch(console.error);
          }
          break;
        }
      }
    },
    
    // Для тестирования - сброс всех пинов
    resetPins: (state) => {
      state.pins = state.pins.map(pin => ({
        ...pin,
        isUnlocked: false,
        unlockedAt: undefined,
        currentCount: 0,
      }));
      state.notification = null;
      
      // Сохраняем сброшенное состояние асинхронно
      saveToStorage(state.pins).catch(console.error);
    },
    
    // Для тестирования - сброс прогресса конкретного пина
    resetPinProgress: (state, action: PayloadAction<string>) => {
      const pinId = action.payload;
      const pin = state.pins.find(p => p.id === pinId);
      
      if (pin) {
        pin.currentCount = 0;
        pin.isUnlocked = false;
        pin.unlockedAt = undefined;
        
        // Сохраняем асинхронно
        saveToStorage(state.pins).catch(console.error);
      }
    },
    
    // Действие для установки загруженных пинов
    setPins: (state, action: PayloadAction<Pin[]>) => {
      state.pins = action.payload;
    },
  },
});

// Асинхронное действие для инициализации пинов
export const initializePins = () => async (dispatch: AppDispatch) => {
  try {
    const pins = await loadFromStorage();
    dispatch(setPins(pins));
  } catch (error) {
    console.error('Failed to initialize pins:', error);
    dispatch(setPins(initialPins));
  }
};

export const { 
  unlockPin, 
  hideNotification, 
  clearNotification, 
  checkPinConditions,
  resetPins,
  resetPinProgress,
  setPins
} = pinsSlice.actions;

export default pinsSlice.reducer;
