import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate, clearCurrentTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { Button, Text } from '@vkontakte/vkui';
import { Icon24Download, Icon24Share } from '@vkontakte/icons';
import { CustomButton } from './CustomButton';
import { MagicLoader } from './MagicLoader';
import { fetchDeckDetails } from '../store/slices/taroDecksSlice';
import { saveTarotReadingToCalendar } from '../utils/calendarUtils';
import bridge from '../bridge';

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

  // Функция для определения иконки расклада по названию
  const getSpreadIcon = (spreadName: string): string => {
    const name = spreadName.toLowerCase();
    
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
      const currentDate = new Date().toLocaleDateString('ru-RU');
      const currentTime = new Date().toLocaleTimeString('ru-RU');
      
      // Создаем структурированный текст
      let content = `═══════════════════════════════════════════════════════════════
                        🔮 РАСКЛАД ТАРО 🔮
═══════════════════════════════════════════════════════════════

📊 РАСКЛАД: ${currentSpread.name}
📅 ДАТА: ${currentDate}
🕐 ВРЕМЯ: ${currentTime}
🎯 ИСТОЧНИК: Taro VK Mini App

`;
      
      if (question.trim()) {
        content += `❓ ВАША ТЕМА/ВОПРОС:
${question}

`;
      }

      content += `✨ ОБЩЕЕ ТОЛКОВАНИЕ:
${parsedInterpretation.message}

`;

      if (parsedInterpretation.positions && parsedInterpretation.positions.length > 0) {
        content += `🃏 ДЕТАЛЬНОЕ ТОЛКОВАНИЕ КАРТ:
───────────────────────────────────────────────────────────────

`;
        
        parsedInterpretation.positions.forEach((pos, index) => {
          const position = selectedCards.find(card => card.position === pos.index);
          const positionInfo = position && currentSpread?.meta[position.position.toString()];
          const positionLabel = positionInfo?.label || `Позиция ${pos.index}`;
          const cardInfo = position && currentDeck?.cards?.find(c => c.id === position.cardId);
          const cardName = cardInfo?.name || 'Неизвестная карта';
          const reversedText = position?.isReversed ? ' (Перевернутая)' : '';
          
          content += `${index + 1}. ${positionLabel}
🃏 Карта: ${cardName}${reversedText}

${pos.interpretation}

`;
        });
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
      const spreadName = currentSpread.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      link.download = `Тaro-${spreadName}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('Файл с толкованием скачан');
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  // Функция для публикации в VK
  const handleShareToVK = async () => {
    if (!parsedInterpretation || !currentSpread) return;

    try {
      let shareText = `🔮 Расклад Таро "${currentSpread.name}"\n\n`;
      
      if (question.trim()) {
        shareText += `❓ Вопрос: ${question}\n\n`;
      }

      // Ограничиваем длину сообщения
      let interpretation = parsedInterpretation.message;
      if (interpretation.length > 200) {
        interpretation = interpretation.substring(0, 200) + '...';
      }
      
      shareText += `✨ ${interpretation}\n\n`;
      shareText += `#ТароГадание #ВКМиниАпп`;

      await bridge.send('VKWebAppShowWallPostBox', {
        message: shareText
      });

      console.log('Публикация в VK успешна');
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
      padding: '16px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
        borderRadius: '12px',
        position: 'relative',
        minHeight: '600px',
        padding: '32px'
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
            src={getSpreadIcon(currentSpread?.name || '')}
            alt="Tarot spread icon"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '400',
              margin: 0,
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              Толкование расклада
            </h1>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '14px',
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

        {/* Разделитель */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d) center/cover',
          marginBottom: '32px'
        }} />

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
              textAlign: 'center'
            }}>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '24px',
                fontStyle: 'italic',
                fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
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
                  Ошибка: {generationError}
                  <br />
                  <span style={{ fontSize: '12px' }}>
                    Проверьте соединение с интернетом или попробуйте позже.
                  </span>
                </>
              }
            </Text>
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
                marginBottom: '16px'
              }}>
                <h3 style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  ТОЛКОВАНИЕ
                </h3>
                
                {!parsedInterpretation.error && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      mode="tertiary"
                      size="s"
                      before={<Icon24Download />}
                      onClick={handleDownloadPDF}
                    >
                      Скачать
                    </Button>
                    <Button
                      mode="tertiary"
                      size="s"
                      before={<Icon24Share />}
                      onClick={handleShareToVK}
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
                              gap: '16px',
                              marginBottom: '16px',
                              lineHeight: 1.3
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
                                {index + 1}
                              </div>
                              <div style={{
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '300',
                                flex: '1',
                                fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}>
                                <div style={{
                                  fontWeight: '400',
                                  marginBottom: '4px',
                                  color: 'rgba(210,175,80,1)'
                                }}>
                                  {positionLabel} — {cardName}{reversedText}
                                </div>
                                <div>
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
                                  gap: '16px',
                                  marginBottom: '16px',
                                  lineHeight: 1.3,
                                  opacity: showAllPositions ? 1 : 0,
                                  transition: 'opacity 0.3s ease-in-out 0.1s'
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
                                    {index + 3}
                                  </div>
                                  <div style={{
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '300',
                                    flex: '1',
                                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                                  }}>
                                    <div style={{
                                      fontWeight: '400',
                                      marginBottom: '4px',
                                      color: 'rgba(210,175,80,1)'
                                    }}>
                                      {positionLabel} — {cardName}{reversedText}
                                    </div>
                                    <div>
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
                              : `Подробное толкование каждой карты (еще ${parsedInterpretation.positions.length - 2} поз.)`
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

        {/* Нижний разделитель */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d) center/cover',
          marginTop: '24px',
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