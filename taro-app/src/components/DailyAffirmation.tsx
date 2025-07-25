import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Text, 
  Title, 
  Card, 
  Spinner, 
  Skeleton 
} from '@vkontakte/vkui';
import { Icon24Download, Icon24Share } from '@vkontakte/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate, clearCurrentTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { ApiType, getLanguageForApi } from '../utils/languageUtils';
import { saveAffirmationToCalendar } from '../utils/calendarUtils';
import { CustomSelect } from './CustomSelect';
import { CustomTextarea } from './CustomTextarea';
import bridge from '../bridge';

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

  // Функция для скачивания файла с аффирмациями
  const handleDownloadPDF = async () => {
    if (!parsedAffirmation || parsedAffirmation.error) return;

    try {
      const currentDate = new Date().toLocaleDateString('ru-RU');
      const currentTime = new Date().toLocaleTimeString('ru-RU');
      
      // Определяем тему аффирмации
      const topic = promptMode === 'custom' 
        ? customPrompt 
        : AFFIRMATION_TOPICS.find(t => t.value === selectedTopic)?.label || 'Персональная тема';
      
      // Создаем структурированный текст
      let content = `═══════════════════════════════════════════════════════════════
                    🌞 ЕЖЕДНЕВНЫЕ АФФИРМАЦИИ 🌞
═══════════════════════════════════════════════════════════════

🎯 ТЕМА: ${topic}
📅 ДАТА: ${currentDate}
🕐 ВРЕМЯ: ${currentTime}
🌟 ИСТОЧНИК: Taro VK Mini App

✨ ${parsedAffirmation.title}

`;

      // Добавляем секции аффирмаций
      parsedAffirmation.sections.forEach((section, index) => {
        content += `${index + 1}. ${section.title}
───────────────────────────────────────────────────────────────

${section.text}

`;
      });

      // Добавляем инструкции по использованию
      if (parsedAffirmation.usage) {
        content += `🔧 КАК ИСПОЛЬЗОВАТЬ:
───────────────────────────────────────────────────────────────

${parsedAffirmation.usage}

`;
      }

      content += `═══════════════════════════════════════════════════════════════
Создано в приложении Taro VK
Дата создания: ${currentDate} ${currentTime}
═══════════════════════════════════════════════════════════════`;

      // Создаем blob с UTF-8 BOM для корректного отображения в Windows
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.href = url;
      const topicName = topic.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      link.download = `Аффирмации-${topicName}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('Файл с аффирмациями скачан');
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  // Функция для публикации в VK
  const handleShareToVK = async () => {
    if (!parsedAffirmation || parsedAffirmation.error) return;

    try {
      const topic = promptMode === 'custom' 
        ? customPrompt 
        : AFFIRMATION_TOPICS.find(t => t.value === selectedTopic)?.label || 'Персональная тема';

      let shareText = `🌞 Ежедневные аффирмации\n\n`;
      shareText += `🎯 Тема: ${topic}\n\n`;
      shareText += `✨ ${parsedAffirmation.title}\n\n`;

      // Добавляем первую аффирмацию как пример
      if (parsedAffirmation.sections.length > 0) {
        const firstSection = parsedAffirmation.sections[0];
        let sectionText = `${firstSection.title}: ${firstSection.text}`;
        
        // Ограничиваем длину для поста в VK
        if (sectionText.length > 150) {
          sectionText = sectionText.substring(0, 150) + '...';
        }
        
        shareText += `${sectionText}\n\n`;
      }
      
      shareText += `#Аффирмации #ПозитивноеМышление #ВКМиниАпп`;

      await bridge.send('VKWebAppShowWallPostBox', {
        message: shareText
      });

      console.log('Публикация аффирмаций в VK успешна');
    } catch (error) {
      console.error('Ошибка при публикации в VK:', error);
    }
  };
  
  // Загружаем шаблон промпта при монтировании компонента
  useEffect(() => {
    // Очищаем предыдущие результаты генерации при входе на страницу
    dispatch(clearGeneratedText());
    // Очищаем предыдущий шаблон промпта (важно для переключения между раскладами и аффирмациями)
    dispatch(clearCurrentTemplate());
    // Загружаем новый шаблон для аффирмаций
    dispatch(fetchPromptTemplate({ promptId: 'daily-affirmation', lang }));
    
    // Очищаем результаты при размонтировании компонента
    return () => {
      dispatch(clearGeneratedText());
      dispatch(clearCurrentTemplate());
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      maxWidth: '320px',
      margin: '0 auto'
    }}>
      <div style={{ width: '100%' }}>
        <Text style={{ 
          color: '#ffffff',
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: '400',
          textAlign: 'center',
          fontFamily: 'Jost'
        }}>
          Выберите тему аффирмации или введите свою
        </Text>
        
        <CustomSelect
          value={promptMode === 'preset' ? selectedTopic : ''}
          options={AFFIRMATION_TOPICS}
          label="Тема аффирмации"
          placeholder="Выберите тему"
          onChange={(value) => {
            setSelectedTopic(value);
            setPromptMode('preset');
          }}
        />
        
        <Text style={{ 
          color: '#ffffff', 
          textAlign: 'center',
          margin: '12px 0',
          fontSize: '14px',
          opacity: 0.8
        }}>
          или
        </Text>
        
        <CustomTextarea
          value={customPrompt}
          placeholder="Введите свою тему для аффирмации"
          label="Персональная тема"
          onChange={(value) => {
            setCustomPrompt(value);
            setPromptMode('custom');
          }}
        />
      </div>
      
      <Button 
        size="l" 
        mode="primary" 
        onClick={handleGenerate}
        disabled={isGenerating || (promptMode === 'preset' && !selectedTopic) || (promptMode === 'custom' && !customPrompt.trim())}
        loading={isGenerating}
        stretched
        style={{
          background: 'linear-gradient(135deg, #E3C77A 0%, #D4AF37 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: '500',
          fontSize: '16px',
          fontFamily: 'Jost'
        }}
      >
        {isGenerating ? 'Генерация...' : 'Получить аффирмации'}
      </Button>
      
      {generationError && (
        <Text style={{ 
          color: '#ff6b6b', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Ошибка: {generationError}
        </Text>
      )}
      
      <Text style={{ 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontFamily: 'Jost'
      }}>
        Язык аффирмаций: {lang === 'english' ? 'английский 🇬🇧' : 'русский 🇷🇺'} 
        (установлен в настройках)
      </Text>
    </div>
  );
  
  // Отображение результата генерации
  const renderResult = () => {
    if (!parsedAffirmation) return null;
    
    // Отображение ошибки в результате
    if (parsedAffirmation.error) {
      return (
        <Card mode="shadow" style={{ 
          padding: '20px', 
          marginTop: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 107, 107, 0.5)',
          borderRadius: '12px'
        }}>
          <Text style={{ 
            color: '#ff6b6b',
            textAlign: 'center',
            fontSize: '16px',
            fontFamily: 'Jost'
          }}>
            {parsedAffirmation.message || 'Произошла ошибка при генерации аффирмаций'}
          </Text>
        </Card>
      );
    }
    
    // Отображение успешного результата
    return (
      <Card mode="shadow" style={{ 
        padding: '24px', 
        marginTop: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(227, 199, 122, 0.5)',
        borderRadius: '12px'
      }}>
        <Title level="2" style={{ 
          marginBottom: '20px',
          color: '#ffffff',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '500',
          fontFamily: 'Jost'
        }}>
          {parsedAffirmation.title}
        </Title>
        
        {parsedAffirmation.sections.map((section, index) => (
          <div key={index} style={{ 
            padding: '16px 0',
            borderBottom: index < parsedAffirmation.sections.length - 1 ? 
              '1px solid rgba(255, 255, 255, 0.2)' : 'none'
          }}>
            <Title level="3" style={{ 
              marginBottom: '8px',
              color: '#E3C77A',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'Jost'
            }}>
              {section.title}
            </Title>
            <Text style={{ 
              lineHeight: '1.6', 
              fontSize: '15px',
              color: '#ffffff',
              fontFamily: 'Jost'
            }}>
              {section.text}
            </Text>
          </div>
        ))}
        
        {parsedAffirmation.usage && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px',
            background: 'rgba(227, 199, 122, 0.2)',
            borderRadius: '8px',
            border: '1px solid rgba(227, 199, 122, 0.3)'
          }}>
            <Title level="3" style={{ 
              marginBottom: '8px',
              color: '#E3C77A',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'Jost'
            }}>
              Как использовать
            </Title>
            <Text style={{ 
              lineHeight: '1.6', 
              fontSize: '14px',
              color: '#ffffff',
              whiteSpace: 'pre-line',
              fontFamily: 'Jost'
            }}>
              {parsedAffirmation.usage}
            </Text>
          </div>
        )}

        {/* Кнопки действий с результатом */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            mode="primary"
            size="m"
            before={<Icon24Download />}
            onClick={handleDownloadPDF}
            style={{
              background: 'linear-gradient(135deg, #E3C77A 0%, #D4AF37 100%)',
              border: 'none',
              color: '#000',
              fontWeight: '500',
              fontFamily: 'Jost'
            }}
          >
            Скачать
          </Button>
          <Button
            mode="secondary"
            size="m"
            before={<Icon24Share />}
            onClick={handleShareToVK}
            style={{
              background: 'transparent',
              border: '2px solid #E3C77A',
              color: '#E3C77A',
              fontWeight: '500',
              fontFamily: 'Jost'
            }}
          >
            Поделиться в VK
          </Button>
        </div>
      </Card>
    );
  };
  
  // Показываем состояние загрузки шаблона
  if (templateLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 0',
        color: '#ffffff'
      }}>
        <Spinner size="m" />
        <Text style={{ 
          marginLeft: '12px',
          color: '#ffffff',
          fontFamily: 'Jost'
        }}>
          Загрузка...
        </Text>
      </div>
    );
  }
  
  // Показываем ошибку загрузки шаблона
  if (templateError) {
    return (
      <Card mode="shadow" style={{ 
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 107, 107, 0.5)',
        borderRadius: '12px'
      }}>
        <Text style={{ 
          color: '#ff6b6b',
          textAlign: 'center',
          fontSize: '16px',
          fontFamily: 'Jost'
        }}>
          Ошибка: {templateError}
        </Text>
      </Card>
    );
  }
  
  // Основной вид компонента
  return (
    <div>
      <div style={{
        marginBottom: '24px'
      }}>
        <Text style={{ 
          color: '#ffffff',
          fontSize: '16px',
          lineHeight: '1.5',
          textAlign: 'center',
          marginBottom: '8px',
          fontFamily: 'Jost'
        }}>
          Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.
        </Text>
        
        {renderPromptForm()}
      </div>
      
      {isGenerating && (
        <Card mode="shadow" style={{ 
          padding: '20px', 
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(227, 199, 122, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Spinner size="s" />
            <Text style={{ 
              marginLeft: '12px',
              color: '#ffffff',
              fontFamily: 'Jost'
            }}>
              Генерация аффирмаций...
            </Text>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton width="100%" height={60} style={{ borderRadius: '8px' }} />
            <Skeleton width="100%" height={60} style={{ borderRadius: '8px' }} />
            <Skeleton width="100%" height={60} style={{ borderRadius: '8px' }} />
          </div>
        </Card>
      )}
      
      {renderResult()}
    </div>
  );
};

export default DailyAffirmation; 