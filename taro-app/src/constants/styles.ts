import backgroundImage from '../assets/background.png';

// Основные цвета приложения
export const APP_BACKGROUND_COLOR = '#0E0B1D';
export const SECTION_BACKGROUND_COLOR = '#1D1830';

// Для случаев когда нужен только цвет фона без изображения
export const BACKGROUND_COLOR = SECTION_BACKGROUND_COLOR;

// Для случаев когда нужен только URL изображения
export const BACKGROUND_IMAGE_URL = `url(${backgroundImage})`;

// Константы для фоновых стилей
export const BACKGROUND_STYLES = {
  backgroundImage: BACKGROUND_IMAGE_URL,
  backgroundColor: BACKGROUND_COLOR,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
} as const;

// Упрощенная версия только с базовыми свойствами
export const BACKGROUND_BASE = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundColor: BACKGROUND_COLOR
} as const;
