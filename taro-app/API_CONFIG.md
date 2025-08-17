# API Configuration System

## Обзор

Централизованная система управления API endpoints для простого переключения между различными окружениями и управления URL адресами.

## Структура

### Файл: `src/constants/api.ts`

Содержит всю конфигурацию API endpoints в одном месте.

## Конфигурация окружений

```typescript
const API_URLS = {
  development: 'http://localhost:3000',
  production: 'http://109.196.100.242:3000',
  // Альтернативный продакшн URL (закомментирован)
  // production: 'https://taro-d8jd.onrender.com',
} as const;
```

## Автоматическое определение окружения

Система автоматически определяет окружение на основе hostname:
- `localhost` или `127.0.0.1` → development
- Любой другой hostname → production

## Использование

### Базовые функции

```typescript
import { API, getApiBaseUrl } from '../constants/api';

// Получить базовый URL
const baseUrl = getApiBaseUrl(); // 'http://localhost:3000' или 'http://109.196.100.242:3000'

// Использовать готовые API методы
const horoscopeUrl = API.horoscope('daily', 'sign=aries&lang=russian');
const generateUrl = API.generate();
const decksUrl = API.decks('includeAll=false&lang=russian');
```

### Доступные API методы

#### Гороскопы
- `API.horoscope(type, params?)` - URL для получения гороскопа
- Пример: `API.horoscope('daily', 'sign=aries&lang=russian')`

#### Генерация контента
- `API.generate()` - URL для генерации контента
- Пример: `API.generate()`

#### Промпт шаблоны
- `API.promptTemplate(promptId, params?)` - URL для получения шаблона промпта
- Пример: `API.promptTemplate('taro-reading', 'lang=russian')`

#### Колоды карт
- `API.decks(params?)` - URL для получения списка колод
- `API.deckDetails(deckId, params?)` - URL для получения деталей колоды
- `API.cardDetails(deckId, cardId, params?)` - URL для получения деталей карты

#### Расклады
- `API.spreads(params?)` - URL для получения списка раскладов
- `API.spreadDetails(spreadId, params?)` - URL для получения деталей расклада

## Миграция с старой системы

### До:
```typescript
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'http://109.196.100.242:3000';

const response = await fetch(`${API_URL}/horoscope/${type}?${params}`);
```

### После:
```typescript
import { API } from '../../constants/api';

const response = await fetch(API.horoscope(type, params.toString()));
```

## Преимущества новой системы

1. **Централизованное управление** - все URL в одном файле
2. **Легкое переключение окружений** - изменить один файл вместо множества
3. **Типобезопасность** - TypeScript типы для всех endpoints
4. **Консистентность** - единый способ формирования URL
5. **Удобство разработки** - легко добавлять новые endpoints
6. **Документированность** - четкая структура и комментарии

## Добавление нового endpoint

1. Добавить endpoint в `API_ENDPOINTS`:
```typescript
export const API_ENDPOINTS = {
  // ... существующие endpoints
  newEndpoint: (param: string) => `/new-endpoint/${param}`,
} as const;
```

2. Добавить метод в `API`:
```typescript
export const API = {
  // ... существующие методы
  newEndpoint: (param: string, params?: string) => {
    const baseUrl = getApiBaseUrl();
    const endpoint = API_ENDPOINTS.newEndpoint(param);
    return params ? `${baseUrl}${endpoint}?${params}` : `${baseUrl}${endpoint}`;
  },
} as const;
```

3. Использовать в коде:
```typescript
import { API } from '../../constants/api';

const response = await fetch(API.newEndpoint('value', 'param=1'));
```

## Смена продакшн сервера

Для смены продакшн сервера достаточно изменить одну строку в `src/constants/api.ts`:

```typescript
const API_URLS = {
  development: 'http://localhost:3000',
  production: 'https://taro-d8jd.onrender.com', // Изменить здесь
} as const;
```

## Обратная совместимость

Система предоставляет функции для обратной совместимости:
- `getBaseApiUrl()` - псевдоним для `getApiBaseUrl()`
- `BASE_API_URL` - константа с базовым URL
- `IS_DEVELOPMENT` - флаг окружения разработки
