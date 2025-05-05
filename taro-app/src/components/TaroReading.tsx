import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate } from '../store/slices/promptSlice';
import { generateText, clearGeneratedText } from '../store/slices/generationSlice';
import { Spinner, Button, Div, Title, Text, Group, Textarea, FormItem, Card, Select, Popover, IconButton, Accordion } from '@vkontakte/vkui';
import { Icon20QuestionOutline } from '@vkontakte/icons';
import { fetchDeckDetails } from '../store/slices/taroDecksSlice';

interface TaroReadingProps {
  spreadId: string;
  deckId: string;
  selectedCards: {
    position: number;
    cardId: string;
    isReversed: boolean;
  }[];
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
  onBack 
}) => {
  const dispatch = useAppDispatch();
  const { currentSpread } = useAppSelector((state) => state.taroSpreads);
  const { currentDeck } = useAppSelector((state) => state.taroDecks); 
  const { currentTemplate, templateLoading, templateError } = useAppSelector((state) => state.prompt);
  const { generatedText, isGenerating, generationError } = useAppSelector((state) => state.generation);
  const [question, setQuestion] = useState<string>('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<string>('custom');
  const [parsedInterpretation, setParsedInterpretation] = useState<ParsedInterpretation | null>(null);

  // Получаем шаблон промпта для выбранного расклада
  useEffect(() => {
    if (spreadId) {
      console.log('Запрос шаблона промпта для расклада:', spreadId);
      dispatch(fetchPromptTemplate({ promptId: spreadId }));
    }
    
    // Очищаем предыдущий результат генерации
    dispatch(clearGeneratedText());
    
    // Загружаем информацию о колоде, если она не загружена
    if (deckId) {
      console.log('Запрос информации о колоде:', deckId);
      dispatch(fetchDeckDetails({ deckId }));
    }
  }, [dispatch, spreadId, deckId]);

  // Парсим полученный результат толкования в JSON
  useEffect(() => {
    if (generatedText) {
      console.log('Получен текст толкования:', generatedText);
      try {
        // Пытаемся распарсить JSON
        const parsedResult = JSON.parse(generatedText);
        console.log('Успешно распарсили JSON:', parsedResult);
        if (parsedResult.message) {
          setParsedInterpretation(parsedResult);
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
    }
  }, [generatedText]);

  // Обработчик выбора предустановленного вопроса
  const handleQuestionChange = (value: string) => {
    if (value === 'custom') {
      setSelectedQuestionIndex('custom');
      // Оставляем текущий пользовательский вопрос
    } else {
      const index = parseInt(value);
      if (currentSpread?.questions && currentSpread.questions[index]) {
        setSelectedQuestionIndex(value);
        setQuestion(currentSpread.questions[index]);
      }
    }
  };

  // Функция для подготовки промпта с данными о картах
  const preparePrompt = () => {
    if (!currentTemplate || !currentSpread || !currentDeck) return null;
    if (!question.trim()) return null; // Если вопрос не введен, не формируем промпт

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

    // Принудительно устанавливаем русский язык
    const responseLang = 'russian'; 

    // Формируем текст промпта напрямую без использования шаблона
    const promptText = `
Вопрос пользователя: ${userQuestion}
Расклад: ${currentSpread.name}
Карты и позиции:
${cardsText}

Сформируй ответ строго по описанному JSON-формату.
Ответ ОБЯЗАТЕЛЬНО должен быть ТОЛЬКО на РУССКОМ ЯЗЫКЕ. Не переходи на английский ни в коем случае.`;

    // Дополняем системный промпт требованием русского языка
    let systemPromptText = currentTemplate.systemPrompt || '';
    
    // Добавляем указание на русский язык в начало системного промпта
    if (!systemPromptText.includes('ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК')) {
      systemPromptText = `ИСПОЛЬЗУЙ ТОЛЬКО РУССКИЙ ЯЗЫК ДЛЯ ВСЕХ ОТВЕТОВ. НЕ ИСПОЛЬЗУЙ АНГЛИЙСКИЙ НИ В КОЕМ СЛУЧАЕ.\n\n${systemPromptText}`;
    }

    // Создаем объект запроса для генерации
    return {
      prompt: promptText,
      systemPrompt: systemPromptText,
      parameters: {
        temperature: currentTemplate.temperature || 0.7,
        maxTokens: currentTemplate.maxTokens || 800,
        responseLang: responseLang,
        language: 'russian',
        outputLanguage: 'russian'
      },
      taroContext: {
        spreadId,
        deckId,
        spreadName: currentSpread.name,
        cards: selectedCards,
        question: userQuestion,
        cardsText,
        responseLang: 'russian'
      }
    };
  };

  // Функция для генерации текста толкования
  const handleGenerate = () => {
    console.log('Текущий шаблон промпта:', currentTemplate);
    console.log('Текущий расклад:', currentSpread);
    console.log('Текущая колода:', currentDeck);
    console.log('Выбранные карты:', selectedCards);
    
    const requestData = preparePrompt();
    if (requestData) {
      console.log('Данные для отправки в LLM:', JSON.stringify(requestData, null, 2));
      
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
  };

  if (templateLoading) {
    return <Spinner size="m" />;
  }

  if (templateError) {
    return (
      <Div>
        <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
          Ошибка: {templateError}
        </Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад
        </Button>
      </Div>
    );
  }

  return (
    <Group>
      <Div>
        <Title level="1">
          {currentSpread ? currentSpread.name : 'Толкование расклада'}
        </Title>

        {/* Выбор предустановленных вопросов */}
        {currentSpread?.questions && currentSpread.questions.length > 0 && (
          <FormItem top="Выберите вопрос" style={{ marginTop: 16 }}>
            <Select
              value={selectedQuestionIndex}
              onChange={(e) => handleQuestionChange(e.target.value)}
              options={[
                { label: 'Свой вопрос', value: 'custom' },
                ...currentSpread.questions.map((q, index) => ({
                  label: q,
                  value: String(index)
                }))
              ]}
            />
          </FormItem>
        )}

        {/* Ввод пользовательского вопроса */}
        <FormItem 
          top={selectedQuestionIndex === 'custom' ? "Введите свой вопрос" : "Изменить вопрос (по желанию)"}
          style={{ marginTop: 16 }}
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Введите ваш вопрос для более точного толкования..."
          />
        </FormItem>

        {/* Отображение выбранных карт */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <Title level="3" style={{ marginBottom: 12 }}>
            Выбранные карты:
          </Title>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px',
            justifyContent: 'center'
          }}>
            {selectedCards.map((card) => {
              const cardInfo = currentDeck?.cards?.find(c => c.id === card.cardId);
              const positionInfo = currentSpread?.meta[card.position.toString()];
              // Находим интерпретацию для этой карты, если она есть
              const cardInterpretation = parsedInterpretation?.positions?.find(pos => pos.index === card.position);
              
              return (
                <Card 
                  key={`${card.position}-${card.cardId}`}
                  style={{ 
                    width: 80, 
                    height: 120, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--vkui--color_background_secondary)',
                    padding: '8px',
                    transform: card.isReversed ? 'rotate(180deg)' : 'none',
                    position: 'relative' // Для абсолютного позиционирования иконки
                  }}
                >
                  {parsedInterpretation && cardInterpretation && (
                    <Popover
                      content={
                        <Div style={{ 
                          maxWidth: '300px', 
                          padding: '12px',
                          transform: card.isReversed ? 'rotate(180deg)' : 'none'
                        }}>
                          <Text weight="2" style={{ marginBottom: '8px' }}>
                            {positionInfo?.label || `Позиция ${card.position}`}
                          </Text>
                          <Text>{cardInterpretation.interpretation}</Text>
                        </Div>
                      }
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: '5px', 
                        right: '5px',
                        transform: card.isReversed ? 'rotate(180deg)' : 'none',
                        zIndex: 1
                      }}>
                        <IconButton 
                          hasActive={false} 
                          aria-label={`Показать толкование карты ${cardInfo?.name || card.cardId} в позиции ${positionInfo?.label || `Позиция ${card.position}`}`}
                        >
                          <Icon20QuestionOutline fill="var(--vkui--color_icon_accent)" />
                        </IconButton>
                      </div>
                    </Popover>
                  )}
                  
                  <Text style={{ 
                    textAlign: 'center',
                    transform: card.isReversed ? 'rotate(180deg)' : 'none',
                    fontSize: '12px'
                  }}>
                    {positionInfo?.label || `Позиция ${card.position}`}
                    <br />
                    {cardInfo?.name || card.cardId}
                  </Text>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Кнопка генерации и результат */}
        <Div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          marginTop: 24,
          marginBottom: 16
        }}>
          <Button 
            size="m" 
            mode="primary" 
            onClick={handleGenerate}
            disabled={isGenerating || selectedCards.length === 0}
            loading={isGenerating}
            stretched
          >
            {isGenerating ? 'Генерация...' : 'Получить толкование'}
          </Button>

          {!question.trim() && (
            <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
              Пожалуйста, введите ваш вопрос для получения толкования
            </Text>
          )}

          {generationError && (
            <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
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
          )}
        </Div>

        {/* Результат генерации */}
        {parsedInterpretation && (
          <Card mode="shadow" style={{ 
            padding: '16px', 
            marginTop: 8, 
            marginBottom: 16,
            backgroundColor: 'var(--vkui--color_background_secondary)'
          }}>
            <Title level="3" style={{ marginBottom: 12 }}>
              Толкование:
            </Title>
            
            {parsedInterpretation.error ? (
              <Text style={{ color: 'var(--vkui--color_text_negative)', marginBottom: 16 }}>
                {parsedInterpretation.message}
              </Text>
            ) : (
              <>
                <Text style={{ 
                  lineHeight: '1.5', 
                  marginBottom: '16px',
                  fontSize: '16px'
                }}>
                  {parsedInterpretation.message}
                </Text>

                {parsedInterpretation.positions && parsedInterpretation.positions.length > 0 && (
                  <Accordion>
                    <Accordion.Summary>
                      <Title level="3" style={{ marginTop: 8 }}>Подробное толкование каждой карты</Title>
                    </Accordion.Summary>
                    <Accordion.Content>
                      <div style={{ marginTop: '16px' }}>
                        {parsedInterpretation.positions.map((pos) => {
                          const position = selectedCards.find(card => card.position === pos.index);
                          const positionInfo = position && currentSpread?.meta[position.position.toString()];
                          const positionLabel = positionInfo?.label || `Позиция ${pos.index}`;
                          
                          return (
                            <div key={pos.index} style={{ marginBottom: '16px' }}>
                              <Text weight="3" style={{ marginBottom: '4px' }}>
                                {positionLabel}:
                              </Text>
                              <Text style={{ lineHeight: '1.5' }}>
                                {pos.interpretation}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </Accordion.Content>
                  </Accordion>
                )}
              </>
            )}
          </Card>
        )}

        <Div style={{ marginTop: 24 }}>
          <Button 
            size="m" 
            mode="secondary" 
            onClick={onBack}
            stretched
          >
            Назад
          </Button>
        </Div>
      </Div>
    </Group>
  );
};

export default TaroReading; 