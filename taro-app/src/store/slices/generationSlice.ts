import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../index';
import { showPurchasePopup, spendStar } from './starsSlice';
import { API } from '../../constants/api';

// Типы данных
export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  key?: string;
  responseLang?: string;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    responseLang?: string;
  };
  taroContext?: {
    spreadId?: string;
    spreadName?: string;
    deckId?: string;
    cards?: {
      position: number;
      cardId: string;
      isReversed: boolean;
    }[];
    question?: string;
    cardsText?: string;
    responseLang?: string;
  };
}

export interface GenerationResponse {
  text?: string;
  message?: string;
  positions?: Array<{
    index: number;
    interpretation: string;
  }>;
  error?: boolean;
}

interface GenerationState {
  generatedText: string | null;
  isGenerating: boolean;
  generationError: string | null;
}

const initialState: GenerationState = {
  generatedText: null,
  isGenerating: false,
  generationError: null,
};

// Функция для подготовки промпта с данными о картах
const prepareRequestData = (requestData: GenerationRequest) => {
  // Получаем ключ запроса или используем стандартный
  const requestKey = requestData.key || 'taro';

  // Подготавливаем параметры
  const parameters = {
    temperature: requestData.parameters?.temperature || 0.7,
    maxTokens: requestData.parameters?.maxTokens || 800,
    responseLang: requestData.responseLang || 'russian'
  };

  // Подготавливаем промпт
  let promptText = requestData.prompt || '';
  
  // Обрабатываем запрос в зависимости от ключа
  switch (requestKey) {
    case 'taro':
      // Для Таро обрабатываем контекст расклада
      if (requestData.taroContext) {
        const { question, spreadName, cardsText } = requestData.taroContext;
        
        // Если промпт не содержит конкретных мест для подстановки, добавляем информацию
        // по стандартному формату
        if (!promptText || (!promptText.includes('{{question}}') && !promptText.includes('{{cards}}'))) {
          const questionText = question ? `Вопрос пользователя: ${question}` : 'Общее толкование расклада';
          const spreadText = spreadName ? `Расклад: ${spreadName}` : '';
          const cardsTitle = 'Карты и позиции:';
          
          // Определяем язык ответа
          const isRussian = parameters.responseLang === 'russian';
          const languageInstruction = isRussian 
            ? 'Ответ ОБЯЗАТЕЛЬНО должен быть ТОЛЬКО на РУССКОМ ЯЗЫКЕ. Не переходи на английский ни в коем случае.'
            : 'Answer MUST be ONLY in ENGLISH. Do not switch to Russian under any circumstances.';
          
          // Основной текст промпта
          promptText = `${questionText}\n${spreadText}\n${cardsTitle}\n${cardsText || ''}\n\nСформируй ответ строго по описанному JSON-формату.\n${languageInstruction}`;
        } else {
          // Если в промпте есть плейсхолдеры, заменяем их
          promptText = promptText
            .replace('{{question}}', question || 'Общее толкование расклада')
            .replace('{{spreadName}}', spreadName || '')
            .replace('{{cards}}', cardsText || '');
          
          // Добавляем требование языка в зависимости от параметров
          const languageRequirement = parameters.responseLang === 'russian' 
            ? '\nОтвет ОБЯЗАТЕЛЬНО должен быть ТОЛЬКО на РУССКОМ языке.'
            : '\nAnswer MUST be ONLY in ENGLISH.';
          promptText += languageRequirement;
        }
      }
      break;
      
    case 'daily-affirmation':
      // Для аффирмаций можем добавить дополнительный контекст
      if (!promptText.includes('тема для аффирмации:')) {
        promptText = `Тема для аффирмации: ${promptText}`;
      }
      break;
      
    default:
      // Для других типов запросов оставляем промпт как есть
      break;
  }

  // Получаем системный промпт
  let systemPrompt = requestData.systemPrompt || '';
  
  // Для Таро добавляем дефолтный системный промпт, если он не был предоставлен
  if (requestKey === 'taro' && !systemPrompt) {
    systemPrompt = `Ты — профессиональный таролог. Отвечай ТОЛЬКО на вопросы о таро, предсказаниях и эзотерике.
    ФОРМАТ ОТВЕТА (JSON):
    {
      "message":  "общее толкование расклада на РУССКОМ языке",
      "positions": [ { "index": 1, "interpretation": "толкование позиции на РУССКОМ языке" } ]
    }
    
    Если вопрос не относится к таро — верни { "error": true, "message": "Ваш вопрос не относится к таро или астрологии." }. Без markdown, ≤ 800 токенов.
    ВАЖНО: Весь ответ должен быть ТОЛЬКО на РУССКОМ языке. Не используй английский язык ни в коем случае.`;
  }

  // НЕ добавляем языковые инструкции здесь, если они уже есть в systemPrompt
  // (TaroReading.tsx сам управляет языковыми инструкциями)
  console.log('Системный промпт из generationSlice (БЕЗ дополнительных языковых инструкций):', systemPrompt);

  // Формируем итоговый объект запроса
  interface RequestObject {
    systemPrompt: string;
    prompt: string;
    temperature: number;
    maxTokens: number;
    responseLang: string;
    key?: string;
  }
  
  const requestObject: RequestObject = {
    systemPrompt,
    prompt: promptText,
    temperature: parameters.temperature,
    maxTokens: parameters.maxTokens,
    responseLang: parameters.responseLang
  };

  // Если есть ключ, добавляем его
  if (requestKey) {
    requestObject.key = requestKey;
  }
  
  // Возвращаем объект запроса
  return requestObject;
};

// Асинхронные действия (thunks)
export const generateText = createAsyncThunk<GenerationResponse, GenerationRequest, {
  dispatch: AppDispatch;
  state: RootState;
}>(
  'generation/generateText',
  async (requestData: GenerationRequest, { dispatch, getState, rejectWithValue }) => {
    try {
      // Проверяем, достаточно ли звёзд для запроса
      const { stars } = getState();
      if (stars.count <= 0) {
        dispatch(showPurchasePopup());
        return rejectWithValue('Недостаточно звёзд для выполнения запроса. Перейдите на страницу покупки звёзд.');
      }
      
      // Подготавливаем данные для запроса
      const preparedData = prepareRequestData(requestData);
      console.log('Подготовленные данные для API:', preparedData);
      
      // Проверяем, что API URL правильно сформирован
      const apiUrl = API.generate();
      console.log('API URL для запроса:', apiUrl);
      
      // Дамп тела запроса для отладки
      const requestBody = JSON.stringify(preparedData);
      console.log('Тело запроса к API (JSON):', requestBody);
      
      // Напрямую выполняем запрос с полным логированием
      console.log('Отправка запроса на генерацию...');
      
      // Создаем AbortController для обработки таймаута
      const controller = new AbortController();
      
      // Определяем таймаут в зависимости от устройства
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Базовый таймаут 20 секунд, увеличиваем для мобильных устройств
      let timeoutDuration = 20000; // 20 секунд
      if (isMobile) {
        timeoutDuration = 30000; // 30 секунд для мобильных устройств
      }
      
      console.log(`Таймаут установлен на: ${timeoutDuration / 1000} секунд`);
      const startTime = Date.now();
      
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutDuration);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
          signal: controller.signal
        });
        
        // Очищаем таймаут, если запрос успешно выполнился
        clearTimeout(timeoutId);
        
        const executionTime = Date.now() - startTime;
        console.log('Статус ответа API:', response.status, response.statusText);
        console.log('Заголовки ответа:', response.headers);
        console.log(`Время выполнения запроса: ${executionTime}мс`);
      
      // Читаем тело ответа как текст для отладки
      const responseText = await response.text();
      console.log('Текст ответа API:', responseText);
      
      // Пробуем распарсить JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Распарсили ответ API как JSON:', data);
      } catch (e) {
        console.error('Ошибка при парсинге ответа как JSON:', e);
        return rejectWithValue(`Некорректный ответ от API: ${responseText.slice(0, 200)}...`);
      }
      
      if (!response.ok) {
        const errorMsg = data?.message || `Ошибка при генерации текста: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        return rejectWithValue(errorMsg);
      }
      
      if (data?.error) {
        const errorMsg = data?.message || 'Ошибка в запросе генерации';
        console.error(errorMsg);
        return rejectWithValue(errorMsg);
      }
      
      // Проверяем структуру ответа - сервер может вернуть либо объект с полем text,
      // либо объект с полями message и positions (JSON толкования),
      // либо объект с полями title, sections, usage (аффирмации)
      if (!data) {
        console.error('Получен пустой ответ от API');
        return rejectWithValue('Получен пустой ответ от сервера');
      }
      
      if (data.text) {
        // Если есть поле text, возвращаем ответ как есть
        // Списываем звезду за успешный запрос
        dispatch(spendStar());
        return data;
      } else if (data.message && (data.positions || Array.isArray(data.positions))) {
        // Если есть поле message и positions, значит это формат JSON-толкования для Таро
        const jsonResult = JSON.stringify(data);
        console.log('Преобразовали объект толкования Таро в строку:', jsonResult);
        // Списываем звезду за успешный запрос
        dispatch(spendStar());
        return {
          text: jsonResult
        };
      } else if (data.title && Array.isArray(data.sections)) {
        // Если есть поля title и sections, это формат ответа для аффирмаций
        console.log('Получен ответ в формате аффирмаций:', data);
        // Для компонента DailyAffirmation мы возвращаем объект напрямую
        // Списываем звезду за успешный запрос
        dispatch(spendStar());
        return {
          text: JSON.stringify(data)
        };
      } else {
        // Проверяем, есть ли в данных поле error - это означает, что LLM вернула ошибку
        if (data.error === true) {
          const errorMsg = data.message || 'LLM вернула ошибку в ответе';
          console.log('LLM вернула ошибку:', errorMsg);
          return rejectWithValue(errorMsg);
        }
        
        // Пытаемся предположить, что ответ уже в нужном формате и просто преобразуем его в строку
        console.log('Получен ответ в неизвестном формате, пробуем преобразовать в JSON:', data);
        try {
          const jsonResult = JSON.stringify(data);
          // Списываем звезду за успешный запрос
          dispatch(spendStar());
          return {
            text: jsonResult
          };
        } catch (e) {
          console.error('Не удалось преобразовать ответ в JSON:', e);
          return rejectWithValue('Неожиданный формат ответа от сервера');
        }
      }
      } catch (fetchError) {
        // Очищаем таймаут в случае ошибки
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      let errorMessage = 'Не удалось сгенерировать текст';
      
      // Проверяем, является ли ошибка таймаутом
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Превышено время ожидания ответа от сервера. Попробуйте еще раз.';
      } else if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `${errorMessage}: ${error}`;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Редьюсер
const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    clearGeneratedText: (state) => {
      state.generatedText = null;
      state.generationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateText.pending, (state) => {
        state.isGenerating = true;
        state.generationError = null;
      })
      .addCase(generateText.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedText = action.payload.text || null;
      })
      .addCase(generateText.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationError = action.payload as string || 'Неизвестная ошибка';
      });
  }
});

export const { clearGeneratedText } = generationSlice.actions;
export default generationSlice.reducer;