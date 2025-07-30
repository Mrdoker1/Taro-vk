import React, { useEffect, useState, useCallback } from 'react';
import { 
  Button, 
  Text, 
  Title, 
  Card, 
  Spinner
} from '@vkontakte/vkui';
import { Icon24Download, Icon24Share } from '@vkontakte/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate, clearCurrentTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { ApiType, getLanguageForApi } from '../utils/languageUtils';
import { saveAffirmationToCalendar } from '../utils/calendarUtils';
import { CustomSelect } from './CustomSelect';
import { CustomTextarea } from './CustomTextarea';
import { MagicLoader } from './MagicLoader';
import bridge from '../bridge';

// Импорт иконок для аффирмаций
import affirmationSunIcon from '../assets/affir-sun.svg';
import affirmationContIcon from '../assets/affir-cont.svg';
import affirmationEnergIcon from '../assets/affir-energ.svg';
import affirmationMoonIcon from '../assets/affir-moon.svg';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { lang } = useAppSelector((state) => state.horoscope); // Используем тот же язык, что и для гороскопа

  // Отслеживаем изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Функция для выбора иконки по порядку секций
  const getAffirmationIcon = (sectionIndex: number): string => {
    const icons = [affirmationSunIcon, affirmationContIcon, affirmationEnergIcon, affirmationMoonIcon];
    return icons[sectionIndex % icons.length];
  };

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
  const preparePrompt = useCallback(() => {
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
  }, [currentTemplate, promptMode, customPrompt, selectedTopic, lang]);
  
  // Обработчик генерации аффирмаций
  const handleGenerate = useCallback(() => {
    const requestData = preparePrompt();
    if (requestData) {
      console.log('Данные для генерации аффирмаций:', requestData);
      dispatch(generateText(requestData));
    } else {
      console.error('Не удалось подготовить данные для запроса');
    }
  }, [dispatch, preparePrompt]);
  
  // Экспортируем состояние для использования в панели
  React.useEffect(() => {
    // Передаем состояние в глобальную переменную или context
    window.affirmationState = {
      customPrompt,
      selectedTopic,
      promptMode,
      isGenerating,
      handleGenerate
    };
  }, [customPrompt, selectedTopic, promptMode, isGenerating, handleGenerate]);
  
  // Форма для выбора темы аффирмации
  const renderPromptForm = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '16px',
      width: '100%'
    }}>
      <div style={{ width: '100%' }}>
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
      
      {generationError && (
        <Text style={{ 
          color: '#ff6b6b', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Ошибка: {generationError}
        </Text>
      )}
    </div>
  );
  
  // Отображение результата генерации
  const renderResult = () => {
    if (!parsedAffirmation) return null;
    
    // Отображение ошибки в результате
    if (parsedAffirmation.error) {
      return (
        <Text style={{ 
          color: '#ff6b6b',
          textAlign: 'center',
          fontSize: '16px',
          fontFamily: 'Jost'
        }}>
          {parsedAffirmation.message || 'Произошла ошибка при генерации аффирмаций'}
        </Text>
      );
    }
    
    // Отображение успешного результата (только содержимое)
    return (
      <>
        {/* Заголовок и кнопки внутри контейнера */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '0',
          marginBottom: '24px'
        }}>
          <Text style={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '400',
            textAlign: isMobile ? 'center' : 'left',
            fontFamily: 'Jost',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: isMobile ? '100%' : 'auto'
          }}>
            Сопровождение на день
          </Text>
          
          {/* Кнопки действий */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button
              mode="tertiary"
              size="s"
              before={<Icon24Download />}
              onClick={handleDownloadPDF}
              style={{ fontSize: '14px' }}
            >
              Скачать
            </Button>
            <Button
              mode="tertiary"
              size="s"
              before={<Icon24Share />}
              onClick={handleShareToVK}
              style={{ fontSize: '14px' }}
            >
              Поделиться в VK
            </Button>
          </div>
        </div>
        
        {/* Секции аффирмаций */}
        {parsedAffirmation.sections.map((section, index) => (
          <div key={index} style={{ 
            marginBottom: index < parsedAffirmation.sections.length - 1 ? '24px' : '0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <img 
                src={getAffirmationIcon(index)} 
                alt="" 
                style={{
                  width: '32px',
                  height: '32px',
                  flexShrink: 0
                }}
              />
              <Title level="3" style={{ 
                margin: 0,
                color: '#E3C77A',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'Jost',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {section.title}
              </Title>
            </div>
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
        
        {/* Инструкции по использованию */}
        {parsedAffirmation.usage && (
          <div style={{ 
            marginTop: '32px', 
            padding: '20px',
            background: 'rgba(227, 199, 122, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(227, 199, 122, 0.2)'
          }}>
            <Title level="3" style={{ 
              marginBottom: '12px',
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
      </>
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
    <div style={{

    }}>
      <div style={{
        display: 'flex',
        gap: isMobile ? '16px' : '24px',
        alignItems: 'flex-start',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
      {/* Левая колонка - форма выбора темы */}
      <div style={{
        flex: isMobile ? '1' : '0 0 320px',
        width: isMobile ? '100%' : 'auto',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        {renderPromptForm()}
      </div>
      
      {/* Правая колонка - результат генерации */}
      <div style={{
        flex: '1',
        minWidth: '0',
        width: isMobile ? '100%' : 'auto'
      }}>
        {/* Единый контейнер для всех состояний */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
        }}>
          {/* Заголовок над контейнером */}
          <Text style={{
            color: '#ffffff',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '400',
            textAlign: 'center',
            fontFamily: 'Jost',
            marginBottom: '16px',
            lineHeight: isMobile ? '1.4' : '1.2'
          }}>
            {isGenerating || parsedAffirmation ? (
              `🌞 Аффирмация на день на ${promptMode === 'custom' 
                ? customPrompt 
                : AFFIRMATION_TOPICS.find(t => t.value === selectedTopic)?.label || 'персональной темы'}`
            ) : (
              'Ждём ваш запрос, чтобы подобрать аффирмации'
            )}
          </Text>
          
          {/* Базовый контейнер */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              alignItems: parsedAffirmation ? 'stretch' : (isGenerating ? 'center' : 'stretch'),
              justifyContent: parsedAffirmation ? 'flex-start' : (isGenerating ? 'center' : 'center'),
              padding: parsedAffirmation ? (isMobile ? '20px 8px' : '24px') : (isMobile ? '16px 8px' : '32px 24px'),
              borderRadius: '0px 0px 4px 4px',
              borderTop: '1px solid rgba(227,199,122,1)',
              minHeight: isGenerating ? '200px' : 'auto'
            }}>
              {/* Содержимое в зависимости от состояния */}
              {isGenerating ? (
                <MagicLoader />
              ) : parsedAffirmation ? (
                renderResult()
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '16px',
                    lineHeight: 1.3,
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      border: '1px solid rgba(151,128,65,0.25)',
                      display: 'flex',
                      height: '32px',
                      width: '32px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: 'rgba(210,175,80,1)',
                      fontWeight: '500',
                      textAlign: 'center',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}>
                      1
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '300',
                      alignSelf: 'stretch',
                      flex: '1',
                      margin: 'auto 0',
                      fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                    }}>
                      Выберите готовую тему из списка или введите свою персональную тему
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      border: '1px solid rgba(151,128,65,0.25)',
                      display: 'flex',
                      height: '32px',
                      width: '32px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: 'rgba(210,175,80,1)',
                      fontWeight: '500',
                      textAlign: 'center',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}>
                      2
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '300',
                      lineHeight: '21px',
                      alignSelf: 'stretch',
                      flex: '1',
                      margin: 'auto 0',
                      fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                    }}>
                      Нажмите кнопку "Получить аффирмации" для генерации персонализированных утверждений
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DailyAffirmation; 