// Типы для тем
export interface ThemeColors {
  app: string;
  section: string;
  customElement: string;
}

export interface ThemeInfo {
  name: string;
  description: string;
  colors: ThemeColors;
}

// Конфигурация всех доступных тем
export const THEME_CONFIGS: Record<string, ThemeInfo> = {
  default: {
    name: 'По умолчанию',
    description: 'Классическая тёмно-фиолетовая тема',
    colors: {
      app: '#0E0B1D',
      section: '#1D1830',
      customElement: '#332955'
    }
  },
  green: {
    name: 'Зелёная',
    description: 'Природные оттенки зелёного',
    colors: {
      app: '#0C150D',
      section: '#141C11',
      customElement: '#1e3223'
    }
  },
  orange: {
    name: 'Оранжевая',
    description: 'Тёплые оттенки коричневого',
    colors: {
      app: '#171611',
      section: '#261B17',
      customElement: '#553329'
    }
  },
  blue: {
    name: 'Синяя',
    description: 'Глубокие синие тона',
    colors: {
      app: '#0B1425',
      section: '#1A2638',
      customElement: '#2A4A6B'
    }
  },
  red: {
    name: 'Красная',
    description: 'Насыщенные красные оттенки',
    colors: {
      app: '#1A0B0B',
      section: '#2D1414',
      customElement: '#5A2828'
    }
  },
  pink: {
    name: 'Розовая',
    description: 'Мягкие розовые тона',
    colors: {
      app: '#1A0E1A',
      section: '#2D1B2D',
      customElement: '#5A355A'
    }
  },
  cyan: {
    name: 'Бирюзовая',
    description: 'Освежающие цвета моря',
    colors: {
      app: '#0B1A1A',
      section: '#142D2D',
      customElement: '#285A5A'
    }
  },
  amber: {
    name: 'Янтарная',
    description: 'Золотистые оттенки',
    colors: {
      app: '#1A1A0B',
      section: '#2D2D14',
      customElement: '#5A5A28'
    }
  },
  violet: {
    name: 'Фиолетовая',
    description: 'Мистические фиолетовые тона',
    colors: {
      app: '#130B1A',
      section: '#26142D',
      customElement: '#4C285A'
    }
  },
  teal: {
    name: 'Морская волна',
    description: 'Глубокие сине-зелёные цвета',
    colors: {
      app: '#0B1A13',
      section: '#142D26',
      customElement: '#285A4C'
    }
  },
  rose: {
    name: 'Пыльная роза',
    description: 'Нежные розово-серые оттенки',
    colors: {
      app: '#1A0B13',
      section: '#2D1426',
      customElement: '#5A284C'
    }
  },
  lime: {
    name: 'Лаймовая',
    description: 'Свежие жёлто-зелёные тона',
    colors: {
      app: '#131A0B',
      section: '#262D14',
      customElement: '#4C5A28'
    }
  }
} as const;

// Типы для ключей тем
export type ThemeKey = keyof typeof THEME_CONFIGS;

// Получение списка тем для селектора
export const getThemeOptions = () => {
  return Object.entries(THEME_CONFIGS).map(([key, config]) => ({
    value: key as ThemeKey,
    label: config.name,
    description: config.description
  }));
};

// Получение цветов темы
export const getThemeColors = (themeKey: ThemeKey): ThemeColors => {
  return THEME_CONFIGS[themeKey].colors;
};

// Проверка существования темы
export const isValidTheme = (themeKey: string): themeKey is ThemeKey => {
  return themeKey in THEME_CONFIGS;
};

// Дефолтная тема
export const DEFAULT_THEME: ThemeKey = 'default';
