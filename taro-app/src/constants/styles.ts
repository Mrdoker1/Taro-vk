import backgroundImage from '../assets/background.png';
import { THEME_CONFIGS, ThemeKey, DEFAULT_THEME, getThemeColors } from './themes';

// Экспортируем типы для удобства
export type { ThemeKey, ThemeColors, ThemeInfo } from './themes';
export { getThemeOptions, isValidTheme, DEFAULT_THEME } from './themes';

// Основные цвета приложения (из дефолтной темы)
const defaultTheme = getThemeColors(DEFAULT_THEME);
export const APP_BACKGROUND_COLOR = defaultTheme.app;
export const SECTION_BACKGROUND_COLOR = defaultTheme.section;
export const CUSTOM_ELEMENT_COLOR = defaultTheme.customElement;

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

// Предустановленные темы (экспортируем для совместимости)
export const THEMES = Object.fromEntries(
  Object.entries(THEME_CONFIGS).map(([key, config]) => [key, config.colors])
) as Record<ThemeKey, typeof THEME_CONFIGS[ThemeKey]['colors']>;

// Применение темы
export const applyTheme = (themeName: ThemeKey) => {
  const themeColors = getThemeColors(themeName);
  setAppBackgroundColor(themeColors.app);
  setSectionBackgroundColor(themeColors.section);
  setCustomElementColor(themeColors.customElement);
};
