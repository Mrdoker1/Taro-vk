// Все языки, поддерживаемые в приложении
export type AppLanguage = 'russian' | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'chinese';

// Формат языка для различных API
export type ApiLanguageFormat = 'full' | 'short' | 'iso639-1' | 'iso639-2';

// Маппинг языков для разных API
interface LanguageMap {
  full: string;       // Полное название (russian, english)
  short: string;      // Короткое название (ru, en)
  iso639_1: string;   // ISO 639-1 (ru, en)
  iso639_2: string;   // ISO 639-2 (rus, eng)
  native: string;     // Название на языке (Русский, English)
}

// Конфигурация известных API
export enum ApiType {
  HOROSCOPE = 'horoscope',
  TARO_DECKS = 'taroDecks',
  WEATHER = 'weather',  // Пример для будущего расширения
}

// Маппинг форматов языка для каждого API
const API_LANGUAGE_FORMATS: Record<ApiType, ApiLanguageFormat> = {
  [ApiType.HOROSCOPE]: 'full',
  [ApiType.TARO_DECKS]: 'short',
  [ApiType.WEATHER]: 'iso639-1',
};

// Полная информация о языках
const LANGUAGES: Record<AppLanguage, LanguageMap> = {
  russian: {
    full: 'russian',
    short: 'ru',
    iso639_1: 'ru',
    iso639_2: 'rus',
    native: 'Русский',
  },
  english: {
    full: 'english',
    short: 'en',
    iso639_1: 'en',
    iso639_2: 'eng',
    native: 'English',
  },
  spanish: {
    full: 'spanish',
    short: 'es',
    iso639_1: 'es',
    iso639_2: 'spa',
    native: 'Español',
  },
  french: {
    full: 'french',
    short: 'fr',
    iso639_1: 'fr',
    iso639_2: 'fra',
    native: 'Français',
  },
  german: {
    full: 'german',
    short: 'de',
    iso639_1: 'de',
    iso639_2: 'deu',
    native: 'Deutsch',
  },
  italian: {
    full: 'italian',
    short: 'it',
    iso639_1: 'it',
    iso639_2: 'ita',
    native: 'Italiano',
  },
  chinese: {
    full: 'chinese',
    short: 'zh',
    iso639_1: 'zh',
    iso639_2: 'zho',
    native: '中文',
  },
};

// Получение языка в нужном формате для API
export function getLanguageForApi(language: AppLanguage, apiType: ApiType): string {
  const format = API_LANGUAGE_FORMATS[apiType];
  const langMap = LANGUAGES[language];
  
  switch (format) {
    case 'full':
      return langMap.full;
    case 'short':
      return langMap.short;
    case 'iso639-1':
      return langMap.iso639_1;
    case 'iso639-2':
      return langMap.iso639_2;
    default:
      return langMap.short;
  }
}

// Получение списка поддерживаемых языков
export function getSupportedLanguages(): AppLanguage[] {
  return Object.keys(LANGUAGES) as AppLanguage[];
}

// Получение языка по умолчанию
export function getDefaultLanguage(): AppLanguage {
  // Пытаемся определить язык браузера
  const browserLang = navigator.language.split('-')[0];
  
  // Проверяем, поддерживается ли он в приложении
  const matchingLang = Object.values(LANGUAGES).find(lang => 
    lang.short === browserLang || lang.iso639_1 === browserLang
  );
  
  if (matchingLang) {
    const foundLang = Object.keys(LANGUAGES).find(
      key => LANGUAGES[key as AppLanguage].short === browserLang
    ) as AppLanguage | undefined;
    
    if (foundLang) return foundLang;
  }
  
  // Если нет, возвращаем русский по умолчанию
  return 'russian';
}

// Получение названия языка для отображения пользователю
export function getLanguageDisplayName(language: AppLanguage): string {
  return LANGUAGES[language]?.native || language;
} 