import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Pin {
  id: string;
  name: string;
  description: string;
  requirement: string;
  image: string;
  isUnlocked: boolean;
  unlockedAt?: string; // дата разблокировки
}

export interface PinNotification {
  pin: Pin;
  isVisible: boolean;
}

interface PinsState {
  pins: Pin[];
  notification: PinNotification | null;
}

const initialPins: Pin[] = [
  {
    id: 'affirmation',
    name: 'Мастер Аффирмаций',
    description: 'Первые шаги в мире позитивных утверждений',
    requirement: 'Создайте свою первую аффирмацию',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
  },
  {
    id: 'calendar',
    name: 'Хранитель Воспоминаний',
    description: 'Ведение дневника - путь к самопознанию',
    requirement: 'Оставьте заметку в календаре',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
  },
  {
    id: 'spreads',
    name: 'Ученик Таро',
    description: 'Первое знакомство с мудростью карт',
    requirement: 'Проведите свой первый расклад',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
  },
  {
    id: 'star',
    name: 'Коллекционер Звезд',
    description: 'Мастерство накопления и обмена энергии',
    requirement: 'Обменяйте голоса на звезды',
    image: '', // будет заполнено в компоненте
    isUnlocked: false,
  },
];

// Загрузка сохраненных пинов из localStorage
const loadPinsFromStorage = (): Pin[] => {
  try {
    const savedPins = localStorage.getItem('taro_pins');
    if (savedPins) {
      const parsedPins = JSON.parse(savedPins) as Pin[];
      // Объединяем сохраненные данные с базовой структурой
      const mergedPins = initialPins.map(initialPin => {
        const savedPin = parsedPins.find(p => p.id === initialPin.id);
        return savedPin ? { ...initialPin, ...savedPin } : initialPin;
      });
      
      // Добавляем новые пины, которых нет в сохраненных данных
      const newPins = initialPins.filter(initialPin => 
        !parsedPins.some(savedPin => savedPin.id === initialPin.id)
      );
      
      return [...mergedPins.filter(pin => parsedPins.some(saved => saved.id === pin.id)), ...newPins];
    }
  } catch (error) {
    console.error('Ошибка загрузки пинов из localStorage:', error);
  }
  return initialPins;
};

// Сохранение пинов в localStorage
const savePinsToStorage = (pins: Pin[]) => {
  try {
    localStorage.setItem('taro_pins', JSON.stringify(pins));
  } catch (error) {
    console.error('Ошибка сохранения пинов в localStorage:', error);
  }
};

const initialState: PinsState = {
  pins: loadPinsFromStorage(),
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
        
        // Сохраняем в localStorage
        savePinsToStorage(state.pins);
        
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
      type: 'affirmation_created' | 'calendar_note_added' | 'tarot_reading_completed';
      data?: unknown;
    }>) => {
      const { type } = action.payload;
      
      switch (type) {
        case 'affirmation_created': {
          const affirmationPin = state.pins.find(p => p.id === 'affirmation');
          if (affirmationPin && !affirmationPin.isUnlocked) {
            affirmationPin.isUnlocked = true;
            affirmationPin.unlockedAt = new Date().toISOString();
            
            // Сохраняем в localStorage
            savePinsToStorage(state.pins);
            
            state.notification = {
              pin: { ...affirmationPin },
              isVisible: true,
            };
          }
          break;
        }
          
        case 'calendar_note_added': {
          const calendarPin = state.pins.find(p => p.id === 'calendar');
          if (calendarPin && !calendarPin.isUnlocked) {
            calendarPin.isUnlocked = true;
            calendarPin.unlockedAt = new Date().toISOString();
            
            // Сохраняем в localStorage
            savePinsToStorage(state.pins);
            
            state.notification = {
              pin: { ...calendarPin },
              isVisible: true,
            };
          }
          break;
        }
          
        case 'tarot_reading_completed': {
          const spreadsPin = state.pins.find(p => p.id === 'spreads');
          if (spreadsPin && !spreadsPin.isUnlocked) {
            spreadsPin.isUnlocked = true;
            spreadsPin.unlockedAt = new Date().toISOString();
            
            // Сохраняем в localStorage
            savePinsToStorage(state.pins);
            
            state.notification = {
              pin: { ...spreadsPin },
              isVisible: true,
            };
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
      }));
      state.notification = null;
      
      // Сохраняем сброшенное состояние в localStorage
      savePinsToStorage(state.pins);
    },
  },
});

export const { 
  unlockPin, 
  hideNotification, 
  clearNotification, 
  checkPinConditions,
  resetPins 
} = pinsSlice.actions;

export default pinsSlice.reducer;
