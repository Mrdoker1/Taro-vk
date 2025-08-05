import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate, clearCurrentTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { checkPinConditions } from '../store/slices/pinsSlice';
import { ApiType, getLanguageForApi } from '../utils/languageUtils';
import { saveAffirmationToCalendar } from '../utils/calendarUtils';
import { ParsedAffirmation, PromptMode } from '../types/affirmation';
import { AFFIRMATION_TOPICS } from '../constants/affirmation';

export const useAffirmation = () => {
  const dispatch = useAppDispatch();
  const { currentTemplate, templateLoading, templateError } = useAppSelector((state) => state.prompt);
  const { generatedText, isGenerating, generationError } = useAppSelector((state) => state.generation);
  const { lang } = useAppSelector((state) => state.horoscope);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [parsedAffirmation, setParsedAffirmation] = useState<ParsedAffirmation | null>(null);
  const [promptMode, setPromptMode] = useState<PromptMode>('preset');

  // Инициализация - загрузка шаблона
  useEffect(() => {
    dispatch(clearGeneratedText());
    dispatch(clearCurrentTemplate());
    dispatch(fetchPromptTemplate({ promptId: 'daily-affirmation', lang }));
    
    return () => {
      dispatch(clearGeneratedText());
      dispatch(clearCurrentTemplate());
    };
  }, [dispatch, lang]);

  // Обработка ответа от API
  useEffect(() => {
    if (!generatedText) {
      setParsedAffirmation(null);
      return;
    }

    try {
      let parsedData;
      
      try {
        parsedData = JSON.parse(generatedText);
      } catch {
        if (typeof generatedText === 'object') {
          parsedData = generatedText;
        } else {
          throw new Error('Неверный формат ответа');
        }
      }
      
      if (parsedData.error) {
        setParsedAffirmation({
          title: 'Ошибка',
          sections: [],
          usage: '',
          error: true,
          message: parsedData.message
        });
        return;
      }
      
      if (parsedData.title && Array.isArray(parsedData.sections)) {
        setParsedAffirmation(parsedData);
        
        // Сохранение в календарь
        const affirmationText = parsedData.sections
          .map((section: { title: string; text: string }) => `${section.title}: ${section.text}`)
          .join(' | ');
        saveAffirmationToCalendar(affirmationText, parsedData).catch(console.error);
        
        // Проверяем условие для разблокировки пина "Мастер Аффирмаций"
        dispatch(checkPinConditions({ type: 'affirmation_created', data: parsedData }));
      } else {
        throw new Error('Неверная структура данных');
      }
    } catch (error) {
      console.error('Ошибка при разборе ответа:', error);
      setParsedAffirmation({
        title: 'Ошибка разбора',
        sections: [],
        usage: '',
        error: true,
        message: 'Не удалось разобрать ответ сервера'
      });
    }
  }, [generatedText, dispatch]);

  // Подготовка промпта для генерации
  const preparePrompt = useCallback(() => {
    if (!currentTemplate) return null;
    
    const promptText = promptMode === 'custom' 
      ? customPrompt 
      : AFFIRMATION_TOPICS.find(topic => topic.value === selectedTopic)?.label || '';
    
    if (!promptText) return null;
    
    const apiLang = getLanguageForApi(lang, ApiType.DAILY_AFFIRMATION);
    
    return {
      prompt: promptText,
      systemPrompt: currentTemplate.systemPrompt,
      key: currentTemplate.key || 'daily-affirmation',
      responseLang: apiLang,
      temperature: currentTemplate.temperature || 0.8,
      maxTokens: currentTemplate.maxTokens || 1000
    };
  }, [currentTemplate, promptMode, customPrompt, selectedTopic, lang]);

  // Генерация аффирмаций
  const handleGenerate = useCallback(() => {
    const requestData = preparePrompt();
    if (requestData) {
      dispatch(generateText(requestData));
    }
  }, [dispatch, preparePrompt]);

  // Экспорт состояния в window для использования в панели
  useEffect(() => {
    window.affirmationState = {
      customPrompt,
      selectedTopic,
      promptMode,
      isGenerating,
      handleGenerate
    };
  }, [customPrompt, selectedTopic, promptMode, isGenerating, handleGenerate]);

  return {
    // Состояние
    customPrompt,
    selectedTopic,
    parsedAffirmation,
    promptMode,
    
    // Состояние загрузки
    templateLoading,
    templateError,
    isGenerating,
    generationError,
    
    // Действия
    setCustomPrompt,
    setSelectedTopic,
    setPromptMode,
    handleGenerate
  };
};
