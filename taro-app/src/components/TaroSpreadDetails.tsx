import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSpreadDetails } from '../store/slices/taroSpreadsSlice';
import { fetchDecks } from '../store/slices/taroDecksSlice';
import { setUserQuestion, loadUserQuestion } from '../store/slices/appSlice';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { CustomSelect } from './CustomSelect';
import { CustomTextarea } from './CustomTextarea';
import { CustomButton } from './CustomButton';
import { MagicLoader } from './MagicLoader';

interface TaroSpreadDetailsProps {
  spreadId: string;
  onBack?: () => void;
}

export const TaroSpreadDetails: React.FC<TaroSpreadDetailsProps> = ({ 
  spreadId, 
  onBack
}) => {
  const dispatch = useAppDispatch();
  const routeNavigator = useRouteNavigator();
  const { currentSpread, spreadLoading, spreadError } = useAppSelector((state) => state.taroSpreads);
  const { decks, decksLoading } = useAppSelector((state) => state.taroDecks);
  const { userQuestion } = useAppSelector((state) => state.app);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');

  // Получаем данные расклада
  useEffect(() => {
    if (spreadId) {
      dispatch(fetchSpreadDetails({ spreadId, lang: 'russian' }));
    }
  }, [dispatch, spreadId]);

  // Получаем список колод
  useEffect(() => {
    dispatch(fetchDecks({ lang: 'russian' }));
  }, [dispatch]);

  // Загружаем сохраненный вопрос пользователя
  useEffect(() => {
    dispatch(loadUserQuestion());
  }, [dispatch]);

  // Устанавливаем первую доступную колоду по умолчанию
  useEffect(() => {
    if (decks.length > 0 && !selectedDeckId) {
      const availableDeck = decks.find(deck => deck.available);
      if (availableDeck) {
        setSelectedDeckId(availableDeck.id);
      }
    }
  }, [decks, selectedDeckId]);

  // Определим, является ли схема сложной (многострочной)
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
    
    // Иконка по умолчанию (можно использовать одну из существующих)
    return 'https://i.ibb.co/fz2F7zv7/one-card.png';
  };

  // Функция для перехода к гаданию с выбранным раскладом и колодой
  const handleStartReading = () => {
    if (selectedDeckId && currentSpread && userQuestion.trim()) {
      routeNavigator.push(`/reading/${spreadId}/${selectedDeckId}`);
    }
  };

  if (spreadLoading || decksLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%'
      }}>
        <MagicLoader />
      </div>
    );
  }

  if (spreadError) {
    return (
      <div style={{
        width: '100%',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        padding: '32px',
        fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: 'rgba(255, 100, 100, 0.9)',
          fontSize: '16px',
          marginBottom: '24px'
        }}>
          Ошибка: {spreadError}
        </p>
        <CustomButton onClick={onBack}>
          Назад к раскладам
        </CustomButton>
      </div>
    );
  }

  if (!currentSpread) {
    return (
      <div style={{
        width: '100%',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        padding: '32px',
        fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '16px',
          marginBottom: '24px',
          color: '#ffffff'
        }}>
          Расклад не найден
        </p>
        <CustomButton onClick={onBack}>
          Назад к раскладам
        </CustomButton>
      </div>
    );
  }

  const availableDecks = decks.filter(deck => deck.available);
  const deckOptions = availableDecks.map(deck => ({
    value: deck.id,
    label: deck.name
  }));

  return (
    <div style={{
      width: '100%',
      background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      padding: '32px',
      fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Заголовок секции */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <img
          src={getSpreadIcon(currentSpread.name)}
          alt={`${currentSpread.name} icon`}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '400',
            margin: '0 0 4px 0',
            fontFamily: 'Jost',
            lineHeight: 1.2
          }}>
            {currentSpread.name}
          </h1>
          
          {/* Описание под заголовком */}
          <p style={{
            fontSize: '16px',
            lineHeight: 1.5,
            margin: 0,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'left',
            fontFamily: 'Jost'
          }}>
            {currentSpread.description}
          </p>
        </div>
      </div>

      {/* Декоративный элемент */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px'
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

      {/* Первая строка - форма для гадания */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Выбор колоды */}
        {currentSpread.available && !currentSpread.paid && (
          <CustomSelect
            label="Выберите колоду для гадания"
            value={selectedDeckId}
            options={deckOptions}
            placeholder="Выберите колоду"
            onChange={setSelectedDeckId}
          />
        )}

        {/* Поле для вопроса */}
        <CustomTextarea
          label="Введите свой вопрос"
          value={userQuestion}
          onChange={(value) => dispatch(setUserQuestion(value))}
          placeholder="Введите вопрос, на который хотите получить ответ..."
          rows={3}
        />

        {/* Кнопка начать гадание */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginTop: '16px',
          justifyContent: 'flex-end'
        }}>
          <CustomButton 
            onClick={onBack}
            style={{ 
              backgroundColor: 'transparent',
              border: '2px solid rgba(227, 199, 122, 0.5)'
            }}
          >
            Назад
          </CustomButton>
          <CustomButton 
            onClick={handleStartReading}
            variant="primary"
            disabled={!currentSpread.available || currentSpread.paid || !selectedDeckId || availableDecks.length === 0 || !userQuestion.trim()}
          >
            {currentSpread.paid 
              ? 'Платный расклад' 
              : availableDecks.length === 0 
                ? 'Нет доступных колод'
                : !userQuestion.trim()
                  ? 'Введите вопрос'
                  : 'Начать гадание'
            }
          </CustomButton>
        </div>
      </div>

      {/* Разделитель */}
      <div style={{
        width: '100%',
        height: '2px',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d) center/cover',
        marginBottom: '32px'
      }} />

      {/* Вторая строка - информационные секции */}
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {/* Схема расклада и значения позиций в одном контейнере */}
        <div style={{ 
          flex: '2 1 300px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Схема расклада */}
          <div style={{ 
            flex: '1 1 150px',
            minWidth: '150px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 400,
              marginBottom: '16px',
              color: '#ffffff',
              textAlign: 'left'
            }}
            className="section-title"
            >
              Схема расклада
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start'
            }}>
              {currentSpread.grid.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    gap: '6px', 
                    marginBottom: '6px',
                    flexWrap: 'wrap'
                  }}
                  className="spread-row"
                >
                  {row.map((position) => (
                    <div 
                      key={position} 
                      style={{ 
                        width: '35px', 
                        height: '48px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(227, 199, 122, 0.2)',
                        border: '2px solid rgba(227, 199, 122, 0.5)',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 500
                      }}
                      className="spread-card"
                    >
                      {position}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Значения позиций */}
          <div style={{ 
            flex: '1 1 150px',
            minWidth: '150px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 400,
              marginBottom: '16px',
              color: '#ffffff',
              textAlign: 'left'
            }}
            className="section-title"
            >
              Значения позиций
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px'
            }}
            className="positions-container"
            >
              {Object.entries(currentSpread.meta).map(([position, meta]) => (
                <div key={position} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: '6px'
                }}>
                  <span style={{ 
                    fontWeight: 500, 
                    minWidth: '20px',
                    color: 'rgba(227, 199, 122, 1)',
                    fontSize: '12px'
                  }}
                  className="position-number"
                  >
                    {position}:
                  </span>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px',
                    lineHeight: 1.2
                  }}
                  className="position-text"
                  >
                    {meta.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Рекомендуемые вопросы отдельно */}
        <div style={{ 
          flex: '1 1 200px',
          minWidth: '200px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 400,
            marginBottom: '16px',
            color: '#ffffff',
            textAlign: 'left'
          }}
          className="section-title"
          >
            Рекомендуемые вопросы
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px'
          }}>
            {currentSpread.questions && currentSpread.questions.length > 0 ? (
              currentSpread.questions.slice(0, 5).map((question: string, index: number) => (
                <div key={index} style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  lineHeight: 1.3,
                  paddingLeft: '8px',
                  borderLeft: '2px solid rgba(227, 199, 122, 0.3)'
                }}>
                  {question}
                </div>
              ))
            ) : (
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Рекомендуемые вопросы будут добавлены позже
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Стили для адаптивности */}
      <style>
        {`
          .section-title {
            font-size: clamp(16px, 4vw, 20px);
            margin-bottom: clamp(12px, 3vw, 20px);
          }
          
          .spread-card {
            width: clamp(22px, 4.5vw, 35px);
            height: clamp(30px, 6vw, 48px);
            font-size: clamp(7px, 1.3vw, 9px);
          }
          
          .spread-row {
            gap: clamp(3px, 0.8vw, 6px);
            margin-bottom: clamp(3px, 0.8vw, 6px);
          }
          
          .positions-container {
            gap: clamp(4px, 1vw, 6px);
          }
          
          .position-number {
            font-size: clamp(10px, 2vw, 12px);
            min-width: clamp(16px, 3vw, 20px);
          }
          
          .position-text {
            font-size: clamp(10px, 2vw, 12px);
            line-height: clamp(1.1, 1.2, 1.3);
          }
          
          @media (max-width: 600px) {
            .section-title {
              font-size: clamp(14px, 4vw, 18px);
              margin-bottom: clamp(10px, 2.5vw, 16px);
            }
            
            .spread-card {
              width: clamp(18px, 4vw, 28px);
              height: clamp(25px, 5.5vw, 38px);
              font-size: clamp(6px, 1.3vw, 8px);
            }
            
            .spread-row {
              gap: clamp(2px, 0.6vw, 4px);
              margin-bottom: clamp(2px, 0.6vw, 4px);
            }
            
            .positions-container {
              gap: clamp(3px, 0.8vw, 5px);
            }
            
            .position-number {
              font-size: clamp(9px, 2vw, 11px);
              min-width: clamp(14px, 2.5vw, 18px);
            }
            
            .position-text {
              font-size: clamp(9px, 2vw, 11px);
              line-height: clamp(1.0, 1.15, 1.2);
            }
          }
          
          @media (max-width: 400px) {
            .section-title {
              font-size: clamp(12px, 4.5vw, 16px);
              margin-bottom: clamp(8px, 2vw, 12px);
            }
            
            .spread-card {
              width: clamp(15px, 4.5vw, 22px);
              height: clamp(20px, 6vw, 30px);
              font-size: clamp(5px, 1.5vw, 7px);
            }
            
            .spread-row {
              gap: clamp(1px, 0.4vw, 3px);
              margin-bottom: clamp(1px, 0.4vw, 3px);
            }
            
            .positions-container {
              gap: clamp(2px, 0.6vw, 4px);
            }
            
            .position-number {
              font-size: clamp(8px, 2.2vw, 10px);
              min-width: clamp(12px, 2.8vw, 16px);
            }
            
            .position-text {
              font-size: clamp(8px, 2.2vw, 10px);
              line-height: clamp(0.9, 1.1, 1.15);
            }
          }
        `}
      </style>

      {/* Нижний разделитель */}
      <div style={{
        width: '100%',
        height: '2px',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d) center/cover',
        marginTop: '32px',
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
    </div>
  );
};

export default TaroSpreadDetails; 