import backgroundImage from '../assets/background.png';

// Основные цвета приложения
export const APP_BACKGROUND_COLOR = '#0E0B1D';
export const SECTION_BACKGROUND_COLOR = '#1D1830';
export const CUSTOM_ELEMENT_COLOR = 'rgba(51, 41, 85, 1)';

// Для случаев когда нужен только цвет фона без изображения
export const BACKGROUND_COLOR = SECTION_BACKGROUND_COLOR;

// Для случаев когда нужен только URL изображения
export const BACKGROUND_IMAGE_URL = `url(${backgroundImage})`;

// Константы для фоновых стилей
export const BACKGROUND_STYLES = {
  backgroundImage: BACKGROUND_IMAGE_URL,
  backgroundColor: 'var(--section-background-color)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
} as const;

// Упрощенная версия только с базовыми свойствами
export const BACKGROUND_BASE = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundColor: 'var(--section-background-color)'
} as const;

// Функции для динамического управления цветами
export const setAppBackgroundColor = (color: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--app-background-color', color);
  }
};

export const setSectionBackgroundColor = (color: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--section-background-color', color);
  }
};

export const setCustomElementColor = (color: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--custom-element-color', color);
  }
};

// Получение текущих значений CSS переменных
export const getAppBackgroundColor = (): string => {
  if (typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--app-background-color')
      .trim() || APP_BACKGROUND_COLOR;
  }
  return APP_BACKGROUND_COLOR;
};

export const getSectionBackgroundColor = (): string => {
  if (typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--section-background-color')
      .trim() || SECTION_BACKGROUND_COLOR;
  }
  return SECTION_BACKGROUND_COLOR;
};

export const getCustomElementColor = (): string => {
  if (typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--custom-element-color')
      .trim() || CUSTOM_ELEMENT_COLOR;
  }
  return CUSTOM_ELEMENT_COLOR;
};

// Сброс цветов к значениям по умолчанию
export const resetColors = () => {
  setAppBackgroundColor(APP_BACKGROUND_COLOR);
  setSectionBackgroundColor(SECTION_BACKGROUND_COLOR);
  setCustomElementColor(CUSTOM_ELEMENT_COLOR);
};

// Предустановленные темы
export const THEMES = {
  default: {
    app: '#0E0B1D',
    section: '#1D1830',
    customElement: 'rgba(51, 41, 85, 1)'
  },
  green: {
    app: '#0C150D',
    section: '#141C11',
    customElement: 'rgba(30, 50, 35, 1)'
  },
  orange: {
    app: '#171611',
    section: '#261B17',
    customElement: 'rgba(85, 51, 41, 1)'
  }
} as const;

// Применение темы
export const applyTheme = (themeName: keyof typeof THEMES) => {
  const theme = THEMES[themeName];
  setAppBackgroundColor(theme.app);
  setSectionBackgroundColor(theme.section);
  setCustomElementColor(theme.customElement);
};
