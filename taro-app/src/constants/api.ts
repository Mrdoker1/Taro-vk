/**
 * Централизованная конфигурация API endpoints
 */

// Базовые URL для разных окружений
const API_URLS = {
  development: 'http://localhost:3000',
  production: 'https://taroapi.uno',
  // Альтернативный продакшн URL (закомментирован)
  // production: 'https://taro-d8jd.onrender.com',
} as const;

// Функция для определения текущего окружения
const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Получение базового URL в зависимости от окружения
export const getApiBaseUrl = (): string => {
  return isDevelopment() ? API_URLS.development : API_URLS.production;
};

// Конфигурация API endpoints
export const API_ENDPOINTS = {
  // Гороскопы
  horoscope: (type: string) => `/horoscope/${type}`,
  
  // Генерация контента
  generate: '/generate',
  
  // Промпт шаблоны
  promptTemplate: (promptId: string) => `/prompt-template/${promptId}`,
  
  // Колоды карт
  decks: '/decks',
  deckDetails: (deckId: string) => `/decks/${deckId}`,
  cardDetails: (deckId: string, cardId: string) => `/decks/${deckId}/cards/${cardId}`,
  
  // Расклады
  spreads: '/spreads',
  spreadDetails: (spreadId: string) => `/spreads/${spreadId}`,
} as const;

// Полные URL для API запросов
export const API = {
  // Гороскопы
  horoscope: (type: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.horoscope(type);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  // Генерация контента
  generate: () => `${getApiBaseUrl()}${API_ENDPOINTS.generate}`,
  
  // Промпт шаблоны
  promptTemplate: (promptId: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.promptTemplate(promptId);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  // Колоды карт
  decks: (params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.decks;
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  deckDetails: (deckId: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.deckDetails(deckId);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  cardDetails: (deckId: string, cardId: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.cardDetails(deckId, cardId);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  // Расклады
  spreads: (params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.spreads;
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
  
  spreadDetails: (spreadId: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.spreadDetails(spreadId);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
} as const;

// Для обратной совместимости - экспортируем базовый URL
export const getBaseApiUrl = getApiBaseUrl;

// Константы для удобства
export const IS_DEVELOPMENT = isDevelopment();
export const BASE_API_URL = getApiBaseUrl();
