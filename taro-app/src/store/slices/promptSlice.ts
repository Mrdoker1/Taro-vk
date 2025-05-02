import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppLanguage, ApiType, getLanguageForApi } from '../../utils/languageUtils';

// Типы данных
export interface PromptTemplate {
  id: string;
  key?: string;
  template?: string; // Поле может отсутствовать
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseLang?: string;
  description?: string;
}

interface PromptState {
  currentTemplate: PromptTemplate | null;
  templateLoading: boolean;
  templateError: string | null;
}

const initialState: PromptState = {
  currentTemplate: null,
  templateLoading: false,
  templateError: null,
};

// Определяем URL API в зависимости от окружения
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://taro-d8jd.onrender.com';

// Дефолтный системный промпт
const DEFAULT_SYSTEM_PROMPT = `Ты — профессиональный таролог. Отвечай ТОЛЬКО на вопросы о таро, предсказаниях и эзотерике.
ФОРМАТ ОТВЕТА (JSON):
{
  "message":  "общее толкование расклада",
  "positions": [ { "index": 1, "interpretation": "толкование позиции" } ]
}

Если вопрос не относится к таро — верни { "error": true, "message": "Ваш вопрос не относится к таро или астрологии." }. Без markdown, ≤ 800 токенов.`;

// Асинхронные действия (thunks)
export const fetchPromptTemplate = createAsyncThunk(
  'prompt/fetchPromptTemplate',
  async ({ promptId, lang = 'russian' as AppLanguage }: { promptId: string; lang?: AppLanguage }, { rejectWithValue }) => {
    try {
      // Используем утилиту для получения языка в нужном формате для API
      const apiLang = getLanguageForApi(lang, ApiType.TARO_DECKS);
      
      console.log(`Загрузка шаблона промпта: ID=${promptId}, язык=${apiLang}`);
      
      const response = await fetch(`${API_URL}/prompt-template/${promptId}?lang=${apiLang}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Шаблон промпта не найден, используем дефолтный шаблон');
          return {
            id: promptId,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 800,
            responseLang: 'russian'
          };
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ошибка при получении шаблона промпта');
      }
      
      const data = await response.json();
      console.log('Получены данные шаблона промпта:', data);
      
      // Нормализуем поле systemPrompt (могла быть опечатка в API)
      if (!data.systemPrompt && data.systemPromt) {
        console.log('Поле systemPromt переименовано в systemPrompt');
        data.systemPrompt = data.systemPromt;
      }
      
      // Если всё равно нет systemPrompt, добавляем дефолтный
      if (!data.systemPrompt) {
        console.log('Шаблон не содержит поле systemPrompt, добавляем дефолтное значение');
        data.systemPrompt = DEFAULT_SYSTEM_PROMPT;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching prompt template:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Не удалось получить шаблон промпта');
    }
  }
);

// Создание слайса
const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
      state.templateError = null;
    },
    // Добавляем возможность установить шаблон вручную (для разработки/тестирования)
    setDefaultTemplate: (state, action: PayloadAction<string>) => {
      // Если нет шаблона, создаем дефолтный для расклада
      if (!state.currentTemplate) {
        state.currentTemplate = {
          id: action.payload || 'default',
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 800,
          responseLang: 'russian'
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchPromptTemplate
      .addCase(fetchPromptTemplate.pending, (state) => {
        state.templateLoading = true;
        state.templateError = null;
      })
      .addCase(fetchPromptTemplate.fulfilled, (state, action: PayloadAction<PromptTemplate>) => {
        state.templateLoading = false;
        state.currentTemplate = action.payload;
        
        // Если вернулся шаблон без системного промпта, добавляем дефолтный
        if (!state.currentTemplate.systemPrompt) {
          state.currentTemplate.systemPrompt = DEFAULT_SYSTEM_PROMPT;
        }
      })
      .addCase(fetchPromptTemplate.rejected, (state, action) => {
        state.templateLoading = false;
        state.templateError = action.payload as string || 'Ошибка загрузки шаблона промпта';
        
        // При ошибке устанавливаем дефолтный шаблон для дальнейшей работы
        state.currentTemplate = {
          id: 'default',
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 800,
          responseLang: 'russian'
        };
      });
  },
});

export const { clearCurrentTemplate, setDefaultTemplate } = promptSlice.actions;
export default promptSlice.reducer; 