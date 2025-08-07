import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate, clearCurrentTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { Button, Text } from '@vkontakte/vkui';
import { Icon24Download, Icon24Share } from '@vkontakte/icons';
import { downloadActivity, shareActivityToVK } from '../utils/shareUtils';
import { CalendarActivity } from '../store/slices/calendarSlice';
import { CustomButton } from './CustomButton';
import { MagicLoader } from './MagicLoader';
import { CustomTooltip } from './CustomTooltip';
import { fetchDeckDetails } from '../store/slices/taroDecksSlice';
import { saveTarotReadingToCalendar } from '../utils/calendarUtils';
import { BACKGROUND_BASE } from '../constants/styles';

interface TaroReadingProps {
  spreadId: string;
  deckId: string;
  selectedCards: {
    position: number;
    cardId: string;
    isReversed: boolean;
  }[];
  userQuestion?: string; // Добавляем вопрос как prop
  onBack?: () => void;
}

interface ParsedInterpretation {
  message: string;
  positions: {
    index: number;
    interpretation: string;
  }[];
  error?: boolean;
}

export const TaroReading: React.FC<TaroReadingProps> = ({ 
  spreadId, 
  deckId,
  selectedCards,
  userQuestion: propUserQuestion, // Переименовываем для избежания конфликта
  onBack 
}) => {
  const dispatch = useAppDispatch();
  const { currentSpread } = useAppSelector((state) => state.taroSpreads);
  const { currentDeck } = useAppSelector((state) => state.taroDecks); 
  const { currentTemplate, templateLoading, templateError } = useAppSelector((state) => state.prompt);
  const { generatedText, isGenerating, generationError } = useAppSelector((state) => state.generation);
  const { lang } = useAppSelector((state) => state.horoscope); // Получаем выбранный язык
  const question = propUserQuestion || ''; // Используем переданный вопрос вместо локального состояния
  const [parsedInterpretation, setParsedInterpretation] = useState<ParsedInterpretation | null>(null);
  const [showAllPositions, setShowAllPositions] = useState(false); // Состояние для управления показом всех позиций
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Состояние для отслеживания мобильной версии

  // Отслеживание изменения размера окна для адаптивности
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Отладочная информация для проверки изображений карт
  console.log('TaroReading - Current deck:', currentDeck?.name);
  console.log('TaroReading - Sample cards with images:', currentDeck?.cards?.slice(0, 3).map(card => ({
    id: card.id,
    name: card.name,
    imageUrl: card.imageUrl
  })));

  // Функция для получения толкования конкретной карты
  const getCardInterpretation = (cardPosition: number): string | null => {
    if (!parsedInterpretation?.positions) return null;
    const position = parsedInterpretation.positions.find(pos => pos.index === cardPosition);
    return position?.interpretation || null;
  };

  // Функция для определения иконки расклада
  const getSpreadIcon = (spread?: { name: string; imageURL?: string }): string => {
    // Используем imageURL из данных бэкенда, если доступно
    if (spread?.imageURL) {
      return spread.imageURL;
    }
    
    // Fallback к захардкоженным изображениям для обратной совместимости
    const name = spread?.name?.toLowerCase() || '';
    
    if (name.includes('одна карта') || name.includes('one card') || name.includes('карта дня')) {
      return 'https://i.ibb.co/fz2F7zv7/one-card.png';
    } else if (name.includes('три карты') || name.includes('three card') || name.includes('прошлое настоящее будущее')) {
      return 'https://i.ibb.co/Q7GphGLZ/three-card.png';
    } else if (name.includes('ло шу') || name.includes('loshu') || name.includes('lo shu')) {
      return 'https://i.ibb.co/KxnrVrd6/loshu.png';
    }
    
    // Иконка по умолчанию
    return 'https://i.ibb.co/fz2F7zv7/one-card.png';
  };

  // Функция для скачивания файла с толкованием
  const handleDownloadPDF = async () => {
    if (!parsedInterpretation || !currentSpread) return;

    try {
      // Создаем временную активность для использования с новой утилитой
      const fullReadingInfo = {
        question: question.trim() || undefined,
        cards: selectedCards.map((card) => {
          const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
          const positionInfo = currentSpread?.meta[card.position.toString()];
          return {
            position: card.position,
            cardName: cardInfo?.name || 'Неизвестная карта',
            positionLabel: positionInfo?.label || `Позиция ${card.position}`,
            isReversed: card.isReversed
          };
        }),
        interpretation: parsedInterpretation.message,
        detailedPositions: parsedInterpretation.positions || []
      };

      const tempActivity: CalendarActivity = {
        id: `temp_${Date.now()}`,
        type: 'tarot_reading',
        title: currentSpread.name,
        summary: `Колода: ${currentDeck?.name || 'Неизвестная колода'}`,
        timestamp: Date.now(),
        fullContent: JSON.stringify(fullReadingInfo)
      };

      await downloadActivity(tempActivity);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  // Функция для публикации в VK
  const handleShareToVK = async () => {
    if (!parsedInterpretation || !currentSpread) return;

    try {
      // Создаем временную активность для использования с новой утилитой
      const fullReadingInfo = {
        question: question.trim() || undefined,
        cards: selectedCards.map((card) => {
          const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
          const positionInfo = currentSpread?.meta[card.position.toString()];
          return {
            position: card.position,
            cardName: cardInfo?.name || 'Неизвестная карта',
            positionLabel: positionInfo?.label || `Позиция ${card.position}`,
            isReversed: card.isReversed
          };
        }),
        interpretation: parsedInterpretation.message,
        detailedPositions: parsedInterpretation.positions || []
      };

      const tempActivity: CalendarActivity = {
        id: `temp_${Date.now()}`,
        type: 'tarot_reading',
        title: currentSpread.name,
        summary: `Колода: ${currentDeck?.name || 'Неизвестная колода'}`,
        timestamp: Date.now(),
        fullContent: JSON.stringify(fullReadingInfo)
      };

      await shareActivityToVK(tempActivity);
    } catch (error) {
      console.error('Ошибка при публикации в VK:', error);
    }
  };

  // Получаем шаблон промпта для выбранного расклада
  useEffect(() => {
    if (spreadId) {
      console.log('Запрос шаблона промпта для расклада:', spreadId, 'язык:', lang);
      // Очищаем предыдущий шаблон промпта
      dispatch(clearCurrentTemplate());
      // Загружаем новый шаблон с учетом языка
      dispatch(fetchPromptTemplate({ promptId: spreadId, lang }));
    }
    
    // Очищаем предыдущий результат генерации
    dispatch(clearGeneratedText());
    
    // Загружаем информацию о колоде, если она не загружена
    if (deckId) {
      console.log('Запрос информации о колоде:', deckId);
      dispatch(fetchDeckDetails({ deckId }));
    }

    // Очищаем при размонтировании компонента
    return () => {
      dispatch(clearGeneratedText());
      dispatch(clearCurrentTemplate());
    };
  }, [dispatch, spreadId, deckId, lang]); // Добавили lang в зависимости

  // Парсим полученный результат толкования в JSON
  useEffect(() => {
    if (generatedText) {
      console.log('Получен текст толкования:', generatedText);
      try {
        // Пытаемся распарсить JSON
        const parsedResult = JSON.parse(generatedText);
        console.log('Успешно распарсили JSON:', parsedResult);
        
        // Проверяем, есть ли ошибка в ответе от LLM
        if (parsedResult.error === true) {
          console.log('LLM вернула ошибку:', parsedResult.message);
          setParsedInterpretation({
            message: parsedResult.message,
            positions: [],
            error: true
          });
          return;
        }
        
        if (parsedResult.message) {
          setParsedInterpretation(parsedResult);
          setShowAllPositions(false); // Сбрасываем состояние аккордеона для новой интерпретации
          
          // Сохраняем расклад в календарь
          if (currentSpread && currentDeck) {
            const cardNames = selectedCards.map(card => {
              const cardInfo = currentDeck.cards?.find(c => c.id === card.cardId);
              return cardInfo?.name || card.cardId;
            });
            
            // Формируем полную информацию о раскладе для календаря
            const fullReadingInfo = {
              spreadName: currentSpread.name,
              deckName: currentDeck.name,
              question: question,
              cards: selectedCards.map(card => {
                const cardInfo = currentDeck.cards?.find(c => c.id === card.cardId);
                const positionInfo = currentSpread.meta[card.position.toString()];
                return {
                  position: card.position,
                  cardName: cardInfo?.name || card.cardId,
                  positionLabel: positionInfo?.label || `Позиция ${card.position}`,
                  isReversed: card.isReversed
                };
              }),
              interpretation: parsedResult.message,
              detailedPositions: parsedResult.positions || []
            };
            
            saveTarotReadingToCalendar(
              currentSpread.name, 
              currentDeck.name, 
              cardNames, 
              JSON.stringify(fullReadingInfo)
            ).catch(console.error);
          }
        } else {
          console.warn('Ошибка формата JSON - отсутствует поле message');
        }
      } catch (error) {
        console.error('Ошибка при парсинге результата:', error);
        // Если не удалось распарсить, отображаем как обычный текст
        setParsedInterpretation({
          message: generatedText,
          positions: []
        });
      }
    } else {
      setParsedInterpretation(null);
      setShowAllPositions(false); // Сбрасываем состояние аккордеона
    }
  }, [generatedText, currentSpread, currentDeck, selectedCards, question]);

  // Функция для подготовки промпта с данными о картах
  const preparePrompt = useCallback(() => {
    if (!currentTemplate || !currentSpread || !currentDeck) return null;
    if (!question.trim()) return null; // Если вопрос не введен, не формируем промпт

    console.log('Подготовка промпта для:', {
      spreadId,
      spreadName: currentSpread.name,
      templateId: currentTemplate.id,
      cardsCount: selectedCards.length
    });

    // Создаем список карт с позициями для промпта
    const cardsText = selectedCards.map(card => {
      const cardInfo = currentDeck.cards?.find(c => c.id === card.cardId);
      const positionInfo = currentSpread.meta[card.position.toString()];
      const positionLabel = positionInfo?.label || `Позиция ${card.position}`;
      const orientation = card.isReversed ? 'reversed' : 'upright';
      
      return `${card.position}. ${positionLabel} — ${cardInfo?.id || card.cardId} (${orientation})`;
    }).join('\n');

    // Получаем текущий вопрос
    const userQuestion = question.trim();

    // Используем выбранный пользователем язык
    const responseLang = lang; 

    // Формируем текст промпта напрямую без использования шаблона
    const promptText = `
Вопрос пользователя: ${userQuestion}
Расклад: ${currentSpread.name} (количество карт: ${selectedCards.length})
Карты и позиции:
${cardsText}

ВАЖНО: Данный расклад "${currentSpread.name}" содержит ИМЕННО ${selectedCards.length} карт. Это НЕ расклад "Ло Шу" (который требует 9 карт). Толкуй расклад согласно его истинному названию и количеству карт.

Сформируй ответ строго по описанному JSON-формату.
Отвечай на языке: ${responseLang === 'russian' ? 'русский' : 'английский'}.`;

    // Дополняем системный промпт требованием нужного языка
    let systemPromptText = currentTemplate.systemPrompt || '';
    
    console.log('=== ОТЛАДКА ЯЗЫКОВЫХ ИНСТРУКЦИЙ ===');
    console.log('Исходный системный промпт из шаблона:', systemPromptText);
    console.log('Выбранный язык:', lang);
    
    // Добавляем указание на выбранный язык в начало системного промпта
    const languageInstruction = lang === 'russian' 
      ? 'ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК ДЛЯ ВСЕХ ОТВЕТОВ. НЕ ИСПОЛЬЗУЙ АНГЛИЙСКИЙ НИ В КОЕМ СЛУЧАЕ.'
      : 'USE ONLY ENGLISH FOR ALL RESPONSES. DO NOT USE RUSSIAN UNDER ANY CIRCUMSTANCES.';
    
    console.log('Нужная языковая инструкция:', languageInstruction);
    
    // Сначала удаляем ВСЕ существующие языковые инструкции с более широкими паттернами
    const originalLength = systemPromptText.length;
    systemPromptText = systemPromptText
      .replace(/ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК.*?СЛУЧАЕ\./gs, '')
      .replace(/USE ONLY ENGLISH.*?CIRCUMSTANCES\./gs, '')
      .replace(/НЕ ИСПОЛЬЗУЙ АНГЛИЙСКИЙ.*?\./g, '')
      .replace(/DO NOT USE RUSSIAN.*?\./g, '')
      .trim();
    
    console.log('После очистки языковых инструкций:', systemPromptText);
    console.log('Удалено символов:', originalLength - systemPromptText.length);
    
    // Затем добавляем только нужную языковую инструкцию
    systemPromptText = `${languageInstruction}

ВАЖНЫЕ ПРАВИЛА ТОЛКОВАНИЯ РАСКЛАДОВ:
- "Одна карта" или "Карта дня" - это расклад из 1 карты
- "Три карты" или "Прошлое настоящее будущее" - это расклад из 3 карт  
- "Ло Шу" - это расклад из 9 карт в формате 3×3
- НЕ путай разные расклады между собой
- Толкуй расклад согласно его истинному названию и количеству карт

${systemPromptText}`;

    console.log('Финальный системный промпт:', systemPromptText);

    // Создаем объект запроса для генерации
    return {
      prompt: promptText,
      systemPrompt: systemPromptText,
        parameters: {
          temperature: currentTemplate.temperature || 0.7,
          maxTokens: currentTemplate.maxTokens || 800,
          responseLang: responseLang,
          language: responseLang,
          outputLanguage: responseLang
        },
        taroContext: {
          spreadId,
          deckId,
          spreadName: currentSpread.name,
          cards: selectedCards,
          question: userQuestion,
          cardsText,
          responseLang: responseLang
        }
      };
    }, [currentTemplate, currentSpread, currentDeck, selectedCards, question, spreadId, deckId, lang]);  // Функция для генерации текста толкования
  const handleGenerate = useCallback(() => {
    console.log('=== ОТЛАДКА ГЕНЕРАЦИИ ===');
    console.log('Текущий шаблон промпта:', currentTemplate);
    console.log('Текущий расклад:', currentSpread);
    console.log('Текущая колода:', currentDeck);
    console.log('Выбранные карты:', selectedCards);
    
    // Очищаем предыдущую ошибку перед началом новой генерации
    dispatch(clearGeneratedText());
    
    const requestData = preparePrompt();
    if (requestData) {
      console.log('=== ФИНАЛЬНЫЕ ДАННЫЕ ДЛЯ LLM ===');
      console.log('Системный промпт:', requestData.systemPrompt);
      console.log('Пользовательский промпт:', requestData.prompt);
      console.log('Параметры:', requestData.parameters);
      
      // Добавляем дополнительную отладочную информацию
      if (!requestData.prompt) {
        console.warn('Внимание: пустой промпт в запросе!');
      }
      
      if (!requestData.taroContext || !requestData.taroContext.cardsText) {
        console.warn('Внимание: отсутствует контекст карт в запросе!');
      }
      
      dispatch(generateText(requestData))
        .unwrap()
        .then((result) => console.log('Результат генерации:', result))
        .catch((error) => console.error('Ошибка генерации:', error));
    } else {
      console.error('Не удалось подготовить данные для запроса');
      alert('Ошибка: не удалось подготовить данные для запроса. Проверьте консоль для подробностей.');
    }
  }, [currentTemplate, currentSpread, currentDeck, selectedCards, dispatch, preparePrompt]);

  // Автоматический запуск генерации после загрузки всех данных
  useEffect(() => {
    // Проверяем, что все необходимые данные загружены И НЕТ ОШИБКИ генерации
    if (currentTemplate && currentSpread && currentDeck && selectedCards.length > 0 && question.trim() && !isGenerating && !generatedText && !generationError) {
      console.log('Автоматический запуск генерации толкования на языке:', lang);
      handleGenerate();
    }
  }, [currentTemplate, currentSpread, currentDeck, selectedCards, question, isGenerating, generatedText, generationError, handleGenerate, lang]);

  if (templateLoading) {
    return <MagicLoader text="Загружаем шаблон толкования..." size="m" />;
  }

  if (templateError) {
    return (
      <div style={{ padding: '16px' }}>
        <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
          Ошибка: {templateError}
        </Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '8px' : '16px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        ...BACKGROUND_BASE,
        borderRadius: '12px',
        position: 'relative',
        // minHeight: isMobile ? '400px' : '600px',
        padding: isMobile ? '16px' : '32px'
      }}>
        {/* Заголовок секции */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          position: 'relative',
          flexDirection: 'row',
          textAlign: 'left'
        }}>
          <img
            src={getSpreadIcon(currentSpread ? { name: currentSpread.name, imageURL: currentSpread.imageURL } : undefined)}
            alt="Tarot spread icon"
            style={{
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '400',
              margin: 0,
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              Толкование расклада
            </h1>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: isMobile ? '12px' : '14px',
              marginTop: '4px',
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              {currentSpread ? currentSpread.name : 'Результат гадания'}
            </Text>
          </div>
        </div>

        {/* Декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a73aa4a82442cd6022e0ae5e650a0c240ffa4f01"
            alt="Decorative element"
            style={{
              width: '90px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Нижний разделитель */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginTop: '16px',
          marginBottom: '32px'
        }} />

        {/* Основной контент в две колонки */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '16px' : '32px',
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Левая колонка - Толкование */}
          <div style={{
            flex: isMobile ? '1' : '2',
            minWidth: 0,
            width: '100%'
          }}>
            {/* Секция с вопросом */}
            {question.trim() && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  marginBottom: 16, 
                  fontSize: '16px', 
                  textAlign: 'center',
                  color: '#ffffff',
                  fontWeight: '300',
                  margin: '0 0 16px 0',
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  Ваш вопрос
                </h3>
                
                <div style={{ 
                  marginBottom: '24px',
                  textAlign: 'center',
                  padding: isMobile ? '0 8px' : '0'
                }}>
                  <Text style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: isMobile ? '18px' : '24px',
                    fontStyle: 'italic',
                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
                    lineHeight: 1.3
                  }}>
                    "{question}"
                  </Text>
                </div>
              </div>
            )}

            {/* Индикатор генерации */}
            {isGenerating && (
              <div style={{ 
                marginBottom: '24px'
              }}>
                <MagicLoader text="Генерируется толкование..." size="m" />
              </div>
            )}

            {/* Ошибка генерации */}
            {generationError && (
              <div style={{ 
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <Text style={{ color: 'var(--vkui--color_text_negative)', fontSize: '16px' }}>
                  {generationError.includes("не относится к таро") ? 
                    generationError : 
                    <>
                      {generationError.includes("Превышено время ожидания") ? (
                        <>
                          <strong>Превышено время ожидания</strong>
                          <br />
                          <span style={{ fontSize: '14px' }}>
                            Сервер слишком долго не отвечает. Это может быть связано с высокой нагрузкой.
                          </span>
                        </>
                      ) : (
                        <>
                          Ошибка: {generationError}
                          <br />
                          <span style={{ fontSize: '12px' }}>
                            Проверьте соединение с интернетом или попробуйте позже.
                          </span>
                        </>
                      )}
                    </>
                  }
                </Text>
                {/* Кнопка повторной отправки */}
                {!generationError.includes("не относится к таро") && (
                  <div style={{ marginTop: '16px' }}>
                    <CustomButton
                      variant="primary"
                      size="m"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Отправляем...' : 'Попробовать снова'}
                    </CustomButton>
                  </div>
                )}
              </div>
            )}

            {/* Результат толкования в стиле InstructionsPanel */}
            {parsedInterpretation && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: '0 0 8px 8px',
                  borderTop: '1px solid rgba(227,199,122,1)'
                }}>
              {/* Заголовок толкования с кнопками */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <h3 style={{
                  color: '#ffffff',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  ТОЛКОВАНИЕ
                </h3>
                
                {!parsedInterpretation.error && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'center' : 'flex-end'
                  }}>
                    <Button
                      mode="tertiary"
                      size="s"
                      before={<Icon24Download />}
                      onClick={handleDownloadPDF}
                      style={{ fontSize: isMobile ? '12px' : '14px' }}
                    >
                      Скачать
                    </Button>
                    <Button
                      mode="tertiary"
                      size="s"
                      before={<Icon24Share />}
                      onClick={handleShareToVK}
                      style={{ fontSize: isMobile ? '12px' : '14px' }}
                    >
                      Поделиться
                    </Button>
                  </div>
                )}
              </div>

              {/* Основное толкование */}
              {parsedInterpretation.error ? (
                <Text style={{ 
                  color: 'var(--vkui--color_text_negative)', 
                  fontSize: '16px',
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  {parsedInterpretation.message}
                </Text>
              ) : (
                <>
                  <Text style={{ 
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '300',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}>
                    {parsedInterpretation.message}
                  </Text>

                  {/* Детальное толкование карт в стиле instruction panel */}
                  {parsedInterpretation.positions && parsedInterpretation.positions.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      {/* Показываем первые две позиции */}
                      {parsedInterpretation.positions
                        .slice(0, 2)
                        .map((pos, index) => {
                          const position = selectedCards.find(card => card.position === pos.index);
                          const positionInfo = position && currentSpread?.meta[position.position.toString()];
                          const positionLabel = positionInfo?.label || `Позиция ${pos.index}`;
                          const cardInfo = position && currentDeck?.cards?.find(c => c.id === position.cardId);
                          const cardName = cardInfo?.name || 'Неизвестная карта';
                          const reversedText = position?.isReversed ? ' (Перевернутая)' : '';
                          
                          return (
                            <div key={pos.index} style={{
                              display: 'flex',
                              width: '100%',
                              alignItems: 'flex-start',
                              gap: isMobile ? '12px' : '16px',
                              marginBottom: '16px',
                              lineHeight: 1.3,
                              flexDirection: window.innerWidth < 480 ? 'column' : 'row'
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
                                flexShrink: 0,
                                alignSelf: window.innerWidth < 480 ? 'flex-start' : 'flex-start'
                              }}>
                                {index + 1}
                              </div>
                              <div style={{
                                color: 'white',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '300',
                                flex: '1',
                                fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}>
                                <div style={{
                                  fontWeight: '400',
                                  marginBottom: '4px',
                                  color: 'rgba(210,175,80,1)',
                                  fontSize: isMobile ? '13px' : '16px'
                                }}>
                                  {positionLabel} — {cardName}{reversedText}
                                </div>
                                <div style={{
                                  lineHeight: 1.4
                                }}>
                                  {pos.interpretation}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      
                      {/* Дополнительные позиции с анимацией */}
                      {parsedInterpretation.positions.length > 2 && (
                        <div style={{
                          overflow: 'hidden',
                          transition: 'max-height 0.3s ease-in-out',
                          maxHeight: showAllPositions ? '1000px' : '0'
                        }}>
                          {parsedInterpretation.positions
                            .slice(2)
                            .map((pos, index) => {
                              const position = selectedCards.find(card => card.position === pos.index);
                              const positionInfo = position && currentSpread?.meta[position.position.toString()];
                              const positionLabel = positionInfo?.label || `Позиция ${pos.index}`;
                              const cardInfo = position && currentDeck?.cards?.find(c => c.id === position.cardId);
                              const cardName = cardInfo?.name || 'Неизвестная карта';
                              const reversedText = position?.isReversed ? ' (Перевернутая)' : '';
                              
                              return (
                                <div key={pos.index} style={{
                                  display: 'flex',
                                  width: '100%',
                                  alignItems: 'flex-start',
                                  gap: isMobile ? '12px' : '16px',
                                  marginBottom: '16px',
                                  lineHeight: 1.3,
                                  opacity: showAllPositions ? 1 : 0,
                                  transition: 'opacity 0.3s ease-in-out 0.1s',
                                  flexDirection: window.innerWidth < 480 ? 'column' : 'row'
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
                                    flexShrink: 0,
                                    alignSelf: window.innerWidth < 480 ? 'flex-start' : 'flex-start'
                                  }}>
                                    {index + 3}
                                  </div>
                                  <div style={{
                                    color: 'white',
                                    fontSize: isMobile ? '14px' : '16px',
                                    fontWeight: '300',
                                    flex: '1',
                                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                                  }}>
                                    <div style={{
                                      fontWeight: '400',
                                      marginBottom: '4px',
                                      color: 'rgba(210,175,80,1)',
                                      fontSize: isMobile ? '13px' : '16px'
                                    }}>
                                      {positionLabel} — {cardName}{reversedText}
                                    </div>
                                    <div style={{
                                      lineHeight: 1.4
                                    }}>
                                      {pos.interpretation}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                      
                      {/* Кнопка "Показать еще" если позиций больше 2 */}
                      {parsedInterpretation.positions.length > 2 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginTop: '16px'
                        }}>
                          <CustomButton
                            variant="secondary"
                            size="s"
                            onClick={() => setShowAllPositions(!showAllPositions)}
                            style={{
                              fontSize: '14px',
                              color: 'rgba(210,175,80,1)',
                              border: '1px solid rgba(210,175,80,0.3)',
                              background: 'rgba(210,175,80,0.1)'
                            }}
                          >
                            {showAllPositions 
                              ? `Скрыть детали (${parsedInterpretation.positions.length - 2} поз.)`
                              : `Подробнее (еще ${parsedInterpretation.positions.length - 2} поз.)`
                            }
                          </CustomButton>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
          </div>

          {/* Правая колонка - Схема карт */}
          <div style={{
            flex: isMobile ? '1' : '1',
            minWidth: isMobile ? '100%' : '300px',
            maxWidth: isMobile ? '100%' : '400px'
          }}>
        {/* Схема расклада без контейнера */}
        {currentSpread && selectedCards.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Динамическое отображение карт в зависимости от типа расклада */}
            {currentSpread.name.toLowerCase().includes('одна карта') || currentSpread.name.toLowerCase().includes('карта дня') ? (
              // Расклад "Одна карта"
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}>
                {selectedCards.map((card) => {
                const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
                const cardInterpretation = getCardInterpretation(card.position);
                const hasInterpretation = parsedInterpretation && !parsedInterpretation.error && cardInterpretation;
                
                // Отладочный вывод для проверки URL изображений
                console.log('One card - Card:', card.cardId, 'ImageUrl:', cardInfo?.imageUrl);
                
                return (
                  <div key={card.position} style={{
                    width: '80px',
                    height: '120px',
                    borderRadius: '8px',
                    transform: card.isReversed ? 'rotate(180deg)' : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: cardInfo?.imageUrl ? `url(${cardInfo.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'rgba(210,175,80,0.1)'
                  }}>
                    {/* Оверлей сверху для номера позиции и иконки тултипа */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.6), transparent)',
                      height: '40px',
                      borderRadius: '8px 8px 0 0',
                      transform: card.isReversed ? 'rotate(180deg)' : 'none'
                    }}>
                      {/* CustomTooltip в левом верхнем углу */}
                      {hasInterpretation && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px'
                        }}>
                          <CustomTooltip
                            content={getCardInterpretation(card.position) || ''}
                            ariaLabel={`Толкование карты ${cardInfo?.name || card.cardId}`}
                            iconButtonStyle={{
                              width: '16px',
                              height: '16px',
                              minWidth: '16px',
                              minHeight: '16px',
                              padding: '0',
                              fontSize: '10px',
                              borderRadius: '2px'
                            }}
                          />
                        </div>
                      )}
                      {/* Номер позиции */}
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(210,175,80,1)',
                        color: '#000',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '500',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}>
                        {card.position}
                      </div>
                    </div>
                    {/* Оверлей для названия карты */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '8px 4px 4px 4px',
                      transform: card.isReversed ? 'rotate(180deg)' : 'none'
                    }}>
                      <div style={{
                        color: 'rgba(210,175,80,1)',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        lineHeight: 1,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}>
                        {cardInfo?.name || card.cardId}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            ) : currentSpread.name.toLowerCase().includes('три карты') || currentSpread.name.toLowerCase().includes('прошлое настоящее будущее') ? (
              // Расклад "Три карты"
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '20px 0'
              }}>
                {selectedCards
                  .sort((a, b) => a.position - b.position)
                  .map((card) => {
                    const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
                    const cardInterpretation = getCardInterpretation(card.position);
                    const hasInterpretation = parsedInterpretation && !parsedInterpretation.error && cardInterpretation;
                    
                    // Отладочный вывод для проверки URL изображений
                    console.log('Three cards - Card:', card.cardId, 'ImageUrl:', cardInfo?.imageUrl);
                    
                    return (
                      <div key={card.position} style={{
                        width: '70px',
                        height: '105px',
                        borderRadius: '6px',
                        transform: card.isReversed ? 'rotate(180deg)' : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: cardInfo?.imageUrl ? `url(${cardInfo.imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'rgba(210,175,80,0.1)'
                      }}>
                        {/* Оверлей сверху для номера позиции и иконки тултипа */}
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.6), transparent)',
                          height: '35px',
                          borderRadius: '6px 6px 0 0',
                          transform: card.isReversed ? 'rotate(180deg)' : 'none'
                        }}>
                          {/* CustomTooltip в левом верхнем углу */}
                          {hasInterpretation && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px'
                            }}>
                              <CustomTooltip
                                content={getCardInterpretation(card.position) || ''}
                                ariaLabel={`Толкование карты ${cardInfo?.name || card.cardId}`}
                                iconButtonStyle={{
                                  width: '14px',
                                  height: '14px',
                                  minWidth: '14px',
                                  minHeight: '14px',
                                  padding: '0',
                                  fontSize: '9px',
                                  borderRadius: '2px'
                                }}
                              />
                            </div>
                          )}
                          {/* Номер позиции */}
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'rgba(210,175,80,1)',
                            color: '#000',
                            fontSize: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '500',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                          }}>
                            {card.position}
                          </div>
                        </div>
                        {/* Оверлей для названия карты */}
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          padding: '6px 2px 2px 2px',
                          transform: card.isReversed ? 'rotate(180deg)' : 'none'
                        }}>
                          <div style={{
                            color: 'rgba(210,175,80,1)',
                            fontSize: '11px',
                            fontWeight: '500',
                            textAlign: 'center',
                            lineHeight: 1,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}>
                            {cardInfo?.name || card.cardId}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              // Универсальная сетка для других раскладов (включая Ло Шу)
              <div style={{
                display: 'grid',
                gridTemplateColumns: selectedCards.length <= 3 ? `repeat(${selectedCards.length}, 1fr)` : 'repeat(3, 1fr)',
                gap: '8px',
                justifyContent: 'center',
                justifyItems: 'center',
                width: '100%',
                padding: '10px'
              }}>
                {selectedCards
                  .sort((a, b) => a.position - b.position)
                  .map((card) => {
                    const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
                    const cardInterpretation = getCardInterpretation(card.position);
                    const hasInterpretation = parsedInterpretation && !parsedInterpretation.error && cardInterpretation;
                    
                    // Отладочный вывод для проверки URL изображений
                    console.log('Universal grid - Card:', card.cardId, 'ImageUrl:', cardInfo?.imageUrl);
                    
                    return (
                      <div key={card.position} style={{
                        width: '75px',
                        height: '110px',
                        borderRadius: '6px',
                        transform: card.isReversed ? 'rotate(180deg)' : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: cardInfo?.imageUrl ? `url(${cardInfo.imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'rgba(210,175,80,0.1)'
                      }}>
                        {/* Оверлей сверху для номера позиции и иконки тултипа */}
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.6), transparent)',
                          height: '35px',
                          borderRadius: '6px 6px 0 0',
                          transform: card.isReversed ? 'rotate(180deg)' : 'none'
                        }}>
                          {/* CustomTooltip в левом верхнем углу */}
                          {hasInterpretation && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px'
                            }}>
                              <CustomTooltip
                                content={getCardInterpretation(card.position) || ''}
                                ariaLabel={`Толкование карты ${cardInfo?.name || card.cardId}`}
                                iconButtonStyle={{
                                  width: '14px',
                                  height: '14px',
                                  minWidth: '14px',
                                  minHeight: '14px',
                                  padding: '0',
                                  fontSize: '8px',
                                  borderRadius: '2px'
                                }}
                              />
                            </div>
                          )}
                          {/* Номер позиции */}
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'rgba(210,175,80,1)',
                            color: '#000',
                            fontSize: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '500',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                          }}>
                            {card.position}
                          </div>
                        </div>
                        {/* Оверлей для названия карты */}
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          padding: '6px 2px 2px 2px',
                          transform: card.isReversed ? 'rotate(180deg)' : 'none'
                        }}>
                          <div style={{
                            color: 'rgba(210,175,80,1)',
                            fontSize: '10px',
                            fontWeight: '500',
                            textAlign: 'center',
                            lineHeight: 1,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {(cardInfo?.name || card.cardId).substring(0, 10)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Схема карт будет отображена после загрузки расклада
          </div>
        )}
      </div>
        </div>

      {/* Нижний разделитель */}
      <div style={{
        width: '100%',
        height: '1px',
        background: 'rgba(232, 210, 140, 0.15)',
        marginBottom: '16px'
      }} />

        {/* Нижний декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/154f96a15bcd974fd38495f6f7aeec22f8b9613a"
            alt="Decorative element"
            style={{
              width: '90px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Кнопка назад */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <CustomButton 
            variant="secondary"
            size="m" 
            onClick={onBack}
            style={{ minWidth: '120px' }}
          >
            Назад
          </CustomButton>
        </div>
      </div>
    </div>
  );
}; 