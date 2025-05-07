import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

// Определяем URL API в зависимости от окружения
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://taro-d8jd.onrender.com';

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
          
          // Основной текст промпта
          promptText = `${questionText}\n${spreadText}\n${cardsTitle}\n${cardsText || ''}\n\nСформируй ответ строго по описанному JSON-формату.\nОтвет ОБЯЗАТЕЛЬНО должен быть ТОЛЬКО на РУССКОМ ЯЗЫКЕ. Не переходи на английский ни в коем случае.`;
        } else {
          // Если в промпте есть плейсхолдеры, заменяем их
          promptText = promptText
            .replace('{{question}}', question || 'Общее толкование расклада')
            .replace('{{spreadName}}', spreadName || '')
            .replace('{{cards}}', cardsText || '');
          
          // Добавляем требование русского языка
          promptText += '\nОтвет ОБЯЗАТЕЛЬНО должен быть ТОЛЬКО на языке, указанном в поле responseLang.';
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

  // Если язык ответа - русский, принудительно добавляем требование русского языка в начало системного промпта
  if (parameters.responseLang === 'russian' && !systemPrompt.startsWith('ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК')) {
    systemPrompt = `ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК ДЛЯ ВСЕХ ОТВЕТОВ. НЕ ИСПОЛЬЗУЙ АНГЛИЙСКИЙ НИ В КОЕМ СЛУЧАЕ.\n\n${systemPrompt}`;
  } else if (parameters.responseLang === 'english' && !systemPrompt.startsWith('USE ONLY ENGLISH')) {
    systemPrompt = `USE ONLY ENGLISH FOR ALL RESPONSES. DO NOT USE ANY OTHER LANGUAGE.\n\n${systemPrompt}`;
  }

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
export const generateText = createAsyncThunk(
  'generation/generateText',
  async (requestData: GenerationRequest, { rejectWithValue }) => {
    try {
      // Подготавливаем данные для запроса
      const preparedData = prepareRequestData(requestData);
      console.log('Подготовленные данные для API:', preparedData);
      
      // Проверяем, что API_URL правильно сформирован
      console.log('API URL для запроса:', `${API_URL}/generate`);
      
      // Дамп тела запроса для отладки
      const requestBody = JSON.stringify(preparedData);
      console.log('Тело запроса к API (JSON):', requestBody);
      
      // Напрямую выполняем запрос с полным логированием
      console.log('Отправка запроса на генерацию...');
      
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      console.log('Статус ответа API:', response.status, response.statusText);
      console.log('Заголовки ответа:', response.headers);
      
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
        return data;
      } else if (data.message && (data.positions || Array.isArray(data.positions))) {
        // Если есть поле message и positions, значит это формат JSON-толкования для Таро
        const jsonResult = JSON.stringify(data);
        console.log('Преобразовали объект толкования Таро в строку:', jsonResult);
        return {
          text: jsonResult
        };
      } else if (data.title && Array.isArray(data.sections)) {
        // Если есть поля title и sections, это формат ответа для аффирмаций
        console.log('Получен ответ в формате аффирмаций:', data);
        // Для компонента DailyAffirmation мы возвращаем объект напрямую
        return {
          text: JSON.stringify(data)
        };
      } else {
        // Пытаемся предположить, что ответ уже в нужном формате и просто преобразуем его в строку
        console.log('Получен ответ в неизвестном формате, пробуем преобразовать в JSON:', data);
        try {
          const jsonResult = JSON.stringify(data);
          return {
            text: jsonResult
          };
        } catch (e) {
          console.error('Не удалось преобразовать ответ в JSON:', e);
          return rejectWithValue('Неожиданный формат ответа от сервера');
        }
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      let errorMessage = 'Не удалось сгенерировать текст';
      
      if (error instanceof Error) {
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