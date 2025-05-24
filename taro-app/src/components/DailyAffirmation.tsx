import React, { useEffect, useState } from 'react';
import { 
  Group, 
  Header, 
  Div, 
  Button, 
  Text, 
  Title, 
  Textarea, 
  FormItem, 
  Card, 
  Select, 
  Spinner, 
  Skeleton 
} from '@vkontakte/vkui';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { ApiType, getLanguageForApi } from '../utils/languageUtils';
import { saveAffirmationToCalendar } from '../utils/calendarUtils';

interface AffirmationTopic {
  value: string;
  label: string;
}

interface ParsedAffirmation {
  title: string;
  sections: {
    title: string;
    text: string;
  }[];
  usage: string;
  error?: boolean;
  message?: string;
}

// Список предустановленных тем для аффирмаций
const AFFIRMATION_TOPICS: AffirmationTopic[] = [
  { value: 'self-love', label: 'Любовь к себе' },
  { value: 'success', label: 'Успех' },
  { value: 'confidence', label: 'Уверенность в себе' },
  { value: 'abundance', label: 'Изобилие' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'health', label: 'Здоровье' },
  { value: 'peace', label: 'Спокойствие' },
  { value: 'gratitude', label: 'Благодарность' },
  { value: 'motivation', label: 'Мотивация' },
  { value: 'growth', label: 'Личностный рост' }
];

export const DailyAffirmation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTemplate, templateLoading, templateError } = useAppSelector((state) => state.prompt);
  const { generatedText, isGenerating, generationError } = useAppSelector((state) => state.generation);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [parsedAffirmation, setParsedAffirmation] = useState<ParsedAffirmation | null>(null);
  const [promptMode, setPromptMode] = useState<'preset' | 'custom'>('preset');
  const { lang } = useAppSelector((state) => state.horoscope); // Используем тот же язык, что и для гороскопа
  
  // Загружаем шаблон промпта при монтировании компонента
  useEffect(() => {
    dispatch(fetchPromptTemplate({ promptId: 'daily-affirmation', lang }));
    
    // Очищаем предыдущие результаты генерации
    return () => {
      dispatch(clearGeneratedText());
    };
  }, [dispatch, lang]);
  
  // Обрабатываем изменения в generatedText
  useEffect(() => {
    if (generatedText) {
      try {
        let parsedData;
        
        try {
          // Пробуем распарсить как JSON строку
          parsedData = JSON.parse(generatedText);
        } catch (parseError) {
          // Если не удалось распарсить, возможно generatedText уже является объектом
          console.log('Не удалось распарсить как JSON, проверяем как объект:', generatedText);
          if (typeof generatedText === 'object') {
            parsedData = generatedText;
          } else {
            throw parseError;
          }
        }
        
        // Проверяем на наличие ошибки в ответе
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
        
        // Проверяем структуру данных
        if (parsedData.title && Array.isArray(parsedData.sections)) {
          console.log('Найдены корректные данные в ответе:', parsedData);
          setParsedAffirmation(parsedData);
          
          // Сохраняем аффирмацию в календарь
          const affirmationText = parsedData.sections
            .map((section: { title: string; text: string }) => `${section.title}: ${section.text}`)
            .join(' | ');
          saveAffirmationToCalendar(affirmationText, parsedData).catch(console.error);
        } else {
          console.error('Неверная структура данных в ответе:', parsedData);
          setParsedAffirmation({
            title: 'Ошибка структуры',
            sections: [],
            usage: '',
            error: true,
            message: 'Получены некорректные данные от сервера'
          });
        }
      } catch (error) {
        console.error('Ошибка при разборе ответа:', error, generatedText);
        setParsedAffirmation({
          title: 'Ошибка разбора',
          sections: [],
          usage: '',
          error: true,
          message: 'Не удалось разобрать ответ сервера'
        });
      }
    } else {
      setParsedAffirmation(null);
    }
  }, [generatedText]);
  
  // Подготавливаем промпт для генерации
  const preparePrompt = () => {
    if (!currentTemplate) {
      console.error('Шаблон промпта не загружен');
      return null;
    }
    
    // Определяем текст промпта в зависимости от выбранного режима
    const promptText = promptMode === 'custom' 
      ? customPrompt 
      : AFFIRMATION_TOPICS.find(topic => topic.value === selectedTopic)?.label || '';
    
    if (!promptText) {
      console.error('Текст промпта не указан');
      return null;
    }
    
    // Получаем язык в правильном формате для API
    const apiLang = getLanguageForApi(lang, ApiType.DAILY_AFFIRMATION);
    console.log(`Язык для API аффирмаций: ${apiLang}`);
    
    // Создаем объект запроса для генерации
    return {
      prompt: promptText,
      systemPrompt: currentTemplate.systemPrompt,
      key: currentTemplate.key || 'daily-affirmation',
      responseLang: apiLang,
      temperature: currentTemplate.temperature || 0.8,
      maxTokens: currentTemplate.maxTokens || 1000
    };
  };
  
  // Обработчик генерации аффирмаций
  const handleGenerate = () => {
    const requestData = preparePrompt();
    if (requestData) {
      console.log('Данные для генерации аффирмаций:', requestData);
      dispatch(generateText(requestData));
    } else {
      console.error('Не удалось подготовить данные для запроса');
    }
  };
  
  // Форма для выбора темы аффирмации
  const renderPromptForm = () => (
    <FormItem 
      top={<span>Выберите тему аффирмации или введите свою</span>}
      style={{ padding: 0 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          mode="default"
          placeholder="Выберите тему"
          options={AFFIRMATION_TOPICS}
          onChange={(event) => {
            setSelectedTopic(event.target.value);
            setPromptMode('preset');
          }}
          value={promptMode === 'preset' ? selectedTopic : ''}
          style={{ marginBottom: 8 }}
        />
        <Text style={{ marginBottom: 12, color: 'var(--vkui--color_text_secondary)' }}>
          или
        </Text>
        <Textarea
          placeholder="Введите свою тему для аффирмации"
          value={customPrompt}
          onChange={(e) => {
            setCustomPrompt(e.target.value);
            setPromptMode('custom');
          }}
        />
      </div>
      
      <Button 
        size="m" 
        mode="primary" 
        onClick={handleGenerate}
        disabled={isGenerating || (promptMode === 'preset' && !selectedTopic) || (promptMode === 'custom' && !customPrompt.trim())}
        loading={isGenerating}
        stretched
      >
        {isGenerating ? 'Генерация...' : 'Получить аффирмации'}
      </Button>
      
      {generationError && (
        <Text style={{ 
          color: 'var(--vkui--color_text_negative)', 
          marginTop: 8 
        }}>
          Ошибка: {generationError}
        </Text>
      )}
    </FormItem>
  );
  
  // Отображение результата генерации
  const renderResult = () => {
    if (!parsedAffirmation) return null;
    
    // Отображение ошибки в результате
    if (parsedAffirmation.error) {
      return (
        <Card mode="shadow" style={{ padding: 16, marginTop: 16 }}>
          <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
            {parsedAffirmation.message || 'Произошла ошибка при генерации аффирмаций'}
          </Text>
        </Card>
      );
    }
    
    // Отображение успешного результата
    return (
      <Card mode="shadow" style={{ 
        padding: 16, 
        marginTop: 16,
        backgroundColor: 'var(--vkui--color_background_secondary)'
      }}>
        <Title level="2" style={{ marginBottom: 16 }}>
          {parsedAffirmation.title}
        </Title>
        
        {parsedAffirmation.sections.map((section, index) => (
          <Div key={index} style={{ 
            padding: '12px 0',
            borderBottom: index < parsedAffirmation.sections.length - 1 ? 
              '1px solid var(--vkui--color_separator_primary)' : 'none'
          }}>
            <Title level="3" style={{ marginBottom: 8 }}>
              {section.title}
            </Title>
            <Text style={{ 
              lineHeight: '1.5', 
              fontSize: '16px'
            }}>
              {section.text}
            </Text>
          </Div>
        ))}
        
        {parsedAffirmation.usage && (
          <Div style={{ 
            marginTop: 16, 
            padding: 12,
            backgroundColor: 'var(--vkui--color_background_secondary--hover)',
            borderRadius: 8
          }}>
            <Title level="3" style={{ marginBottom: 8 }}>
              Как использовать
            </Title>
            <Text style={{ 
              lineHeight: '1.5', 
              fontSize: '14px',
              whiteSpace: 'pre-line'
            }}>
              {parsedAffirmation.usage}
            </Text>
          </Div>
        )}
      </Card>
    );
  };
  
  // Показываем состояние загрузки шаблона
  if (templateLoading) {
    return (
      <Group header={<Header size="s">🌞 Ежедневные аффирмации</Header>}>
        <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size="m" />
        </Div>
      </Group>
    );
  }
  
  // Показываем ошибку загрузки шаблона
  if (templateError) {
    return (
      <Group header={<Header size="s">🌞 Ежедневные аффирмации</Header>}>
        <Card mode="shadow" style={{ padding: 16 }}>
          <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
            Ошибка: {templateError}
          </Text>
        </Card>
      </Group>
    );
  }
  
  // Основной вид компонента
  return (
    <Group header={<Header size="s">🌞 Ежедневные аффирмации</Header>}>
      <Card mode="shadow" style={{ padding: 16 }}>
        <Title level="3" style={{ marginBottom: 8 }}>
          Аффирмации на сегодня
        </Title>
        <Text style={{ marginBottom: 8 }}>
          Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: 'var(--vkui--color_text_secondary)',
          marginBottom: 16
        }}>
          Язык аффирмаций: {lang === 'english' ? 'английский 🇬🇧' : 'русский 🇷🇺'} 
          (установлен в настройках)
        </Text>
        
        {renderPromptForm()}
      </Card>
      
      {isGenerating && (
        <Card mode="shadow" style={{ padding: 16, marginTop: 16 }}>
          <Skeleton width="100%" height={16} style={{ marginBottom: 12 }} />
          <Skeleton width="90%" height={16} style={{ marginBottom: 24 }} />
          
          <Div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0 }}>
            <Skeleton width="100%" height={80} />
            <Skeleton width="100%" height={80} />
            <Skeleton width="100%" height={80} />
          </Div>
        </Card>
      )}
      
      {renderResult()}
    </Group>
  );
};

export default DailyAffirmation; 