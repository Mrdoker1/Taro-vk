import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDeckDetails } from '../store/slices/taroDecksSlice';
import { fetchSpreadDetails } from '../store/slices/taroSpreadsSlice';
import { Spinner, Div, Text } from '@vkontakte/vkui';
import CardDndSelector from './dnd/CardDndSelector';
import { CustomSelect } from './CustomSelect';
import { CustomButton } from './CustomButton';
import { CustomToggle } from './CustomToggle';
import { useResponsive } from '../hooks/useResponsive';
import tshirtIcon from '../assets/tshirt.svg';
import { BACKGROUND_BASE } from '../constants/styles';

interface CardSelectorProps {
  spreadId: string;
  deckId: string;
  userQuestion?: string;
  onCardsSelected: (cards: { position: number; cardId: string; isReversed: boolean }[]) => void;
  onBack?: () => void;
}

interface SelectedCard {
  position: number;
  cardId: string;
  isReversed: boolean;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ 
  spreadId, 
  deckId,
  userQuestion = '',
  onCardsSelected,
  onBack 
}) => {
  const dispatch = useAppDispatch();
  const { currentSpread } = useAppSelector((state) => state.taroSpreads);
  const { currentDeck, deckLoading, deckError } = useAppSelector((state) => state.taroDecks);
  const { useManualCardSelection } = useAppSelector((state) => state.app);
  const isMobile = useResponsive();
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [allPositions, setAllPositions] = useState<number[]>([]);
  const [shuffledCards, setShuffledCards] = useState<Array<{id: string; name: string; imageUrl?: string}>>([]);

  // Получаем данные колоды и расклада
  useEffect(() => {
    if (deckId) {
      dispatch(fetchDeckDetails({ deckId }));
    }
    if (spreadId) {
      dispatch(fetchSpreadDetails({ spreadId }));
    }
  }, [dispatch, deckId, spreadId]);

  // Определяем позиции карт из расклада
  useEffect(() => {
    if (currentSpread?.grid) {
      const positions: number[] = [];
      currentSpread.grid.forEach(row => {
        row.forEach(position => {
          positions.push(position);
        });
      });
      setAllPositions(positions.sort((a, b) => a - b));
    }
  }, [currentSpread]);

  // Инициализируем перемешанные карты когда загружается колода
  useEffect(() => {
    if (currentDeck?.cards) {
      setShuffledCards([...currentDeck.cards]);
    }
  }, [currentDeck]);

  // Функция для перетасовки карт (алгоритм Фишера-Йетса)
  const shuffleCards = () => {
    if (!currentDeck?.cards) return;
    
    const newCards = [...currentDeck.cards];
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setShuffledCards(newCards);
  };

  // Функция для возврата карты в конец колоды
  const handleCardReturned = (cardId: string) => {
    setShuffledCards(prev => {
      // Удаляем карту из текущей позиции (если она есть)
      const filteredCards = prev.filter(card => card.id !== cardId);
      
      // Находим карту в оригинальной колоде
      const cardToReturn = currentDeck?.cards?.find(card => card.id === cardId);
      
      if (cardToReturn) {
        // Добавляем карту в конец колоды
        return [...filteredCards, cardToReturn];
      }
      
      return filteredCards;
    });
  };

  // Функция для обновления выбранной карты
  const handleCardSelect = (position: number, cardId: string) => {
    setSelectedCards(prev => {
      const newCards = [...prev];
      const existingIndex = newCards.findIndex(card => card.position === position);
      
      if (existingIndex >= 0) {
        if (cardId) {
          newCards[existingIndex].cardId = cardId;
        } else {
          newCards.splice(existingIndex, 1);
        }
      } else if (cardId) {
        newCards.push({ position, cardId, isReversed: false });
      }
      
      return newCards;
    });
  };

  // Функция для обновления перевернутого состояния карты
  const handleCardReversedToggle = (position: number, isReversed: boolean) => {
    setSelectedCards(prev => {
      const newCards = [...prev];
      const existingIndex = newCards.findIndex(card => card.position === position);
      
      if (existingIndex >= 0) {
        newCards[existingIndex].isReversed = isReversed;
      }
      
      return newCards;
    });
  };

  // Функция для проверки готовности к отправке
  const isReadyToSubmit = () => {
    return allPositions.length > 0 && selectedCards.length === allPositions.length;
  };

  // Функция для отправки выбранных карт
  const handleSubmit = () => {
    if (isReadyToSubmit()) {
      onCardsSelected(selectedCards);
    }
  };

  // Подготовка данных позиций для DnD селектора
  const getPositionsForDnd = () => {
    if (!currentSpread?.meta) return [];
    
    return allPositions.map(position => ({
      position,
      label: currentSpread.meta[position.toString()]?.label || `Позиция ${position}`
    }));
  };

  if (deckLoading) {
    return (
      <Div style={{ 
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          ...BACKGROUND_BASE,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          padding: isMobile ? '16px 8px' : '32px',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spinner size="m" />
        </div>
      </Div>
    );
  }

  if (deckError) {
    return (
      <Div style={{ 
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          ...BACKGROUND_BASE,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          padding: isMobile ? '16px 8px' : '32px',
          textAlign: 'center'
        }}>
          <Text style={{ 
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '24px',
            fontFamily: 'Jost'
          }}>
            Ошибка: {deckError}
          </Text>
          <CustomButton onClick={onBack} variant="secondary" size="m">
            Назад
          </CustomButton>
        </div>
      </Div>
    );
  }

  if (!currentDeck || !currentSpread) {
    return (
      <Div style={{ 
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          ...BACKGROUND_BASE,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          padding: isMobile ? '16px 8px' : '32px',
          textAlign: 'center'
        }}>
          <Text style={{ 
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '24px',
            fontFamily: 'Jost'
          }}>
            Не удалось загрузить данные колоды или расклада
          </Text>
          <CustomButton onClick={onBack} variant="secondary" size="m">
            Назад
          </CustomButton>
        </div>
      </Div>
    );
  }

  // Получаем карты из колоды, если они есть
  const cards = shuffledCards.length > 0 ? shuffledCards : (currentDeck?.cards || []);

  // Выбор режима селектора карт - если не включен ручной режим, показываем перетаскивание
  if (!useManualCardSelection) {
    return (
      <CardDndSelector
        spreadName={currentSpread.name}
        spreadImageURL={currentSpread.imageURL}
        deckName={currentDeck.name}
        cards={cards}
        positions={getPositionsForDnd()}
        spreadGrid={currentSpread.grid} // Передаем структуру сетки расклада
        userQuestion={userQuestion}
        backImageUrl={currentDeck.coverImageUrl} // Используем coverImageUrl как рубашку карты
        onCardsSelected={onCardsSelected}
        onBack={onBack}
        onShuffleCards={shuffleCards}
        onCardReturned={handleCardReturned}
      />
    );
  }

  // Если включен ручной режим, показываем выбор из списка
  return (
    <Div style={{ 
      padding: '0 12px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        ...BACKGROUND_BASE,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        padding: isMobile ? '16px 8px' : '32px'
      }}>
        {/* Заголовок секции */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <img
            src={currentSpread.imageURL || tshirtIcon}
            alt="Spread icon"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '400',
              margin: 0,
              fontFamily: 'Jost',
              lineHeight: 1.2,
              marginBottom: '8px'
            }}>
              Выбор карт для расклада
            </h1>
            <div style={{
              color: '#ffffff',
              fontSize: '16px',
              lineHeight: '1.5',
              textAlign: 'left',
              fontFamily: 'Jost',
              opacity: 0.9
            }}>
              {`${currentSpread.name} - ${currentDeck.name}`}
            </div>
          </div>
        </div>

        {/* Декоративные элементы */}
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

        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginBottom: '32px'
        }} />

        {/* Форма выбора карт */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '500',
              fontFamily: 'Jost'
            }}>
              Выберите карты для каждой позиции:
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'Jost',
                opacity: 0.9
              }}>
                Заполнено: {selectedCards.length} из {allPositions.length}
              </div>
              <div style={{
                width: '100px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(selectedCards.length / allPositions.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(227, 199, 122, 1), rgba(255, 215, 0, 0.8))',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Кнопка очистки */}
          {selectedCards.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '8px'
            }}>
              <CustomButton
                variant="secondary"
                onClick={() => setSelectedCards([])}
                size="s"
                style={{
                  opacity: 0.8,
                  fontSize: '14px'
                }}
              >
                Очистить все
              </CustomButton>
            </div>
          )}

          {allPositions.map(position => {
            const selectedCard = selectedCards.find(card => card.position === position);
            const positionLabel = currentSpread.meta[position.toString()]?.label || `Позиция ${position}`;
            const isCompleted = selectedCard && selectedCard.cardId;
            
            return (
              <div 
                key={position}
                style={{
                  paddingBottom: '20px',
                  position: 'relative'
                }}
              >
                {/* Чекмарк */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isCompleted ? 1 : 0,
                  transition: 'all 0.3s ease'
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M13.5 4.5L6 12L2.5 8.5" 
                      stroke="rgba(227, 199, 122, 1)" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  fontFamily: 'Jost',
                  paddingRight: '30px'
                }}>
                  {positionLabel}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      value={selectedCard?.cardId || ''}
                      options={cards.map(card => ({
                        label: card.name,
                        value: card.id
                      }))}
                      label=""
                      placeholder="Выберите карту для этой позиции"
                      onChange={(value) => handleCardSelect(position, value)}
                    />
                  </div>

                  {selectedCard && (
                    <div style={{ flexShrink: 0 }}>
                      <CustomToggle
                        checked={selectedCard.isReversed}
                        onChange={() => handleCardReversedToggle(position, !selectedCard.isReversed)}
                        label="Перевернута"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Нижний разделитель */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginTop: '32px',
          marginBottom: '16px'
        }} />

        {/* Нижний декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px'
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

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          gap: '12px',
          margin: '0 auto',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <CustomButton
            variant="secondary"
            onClick={onBack}
            size="m"
          >
            Назад
          </CustomButton>
          <CustomButton 
            variant="primary"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit()}
            size="m"
          >
            {isReadyToSubmit() ? 'Продолжить' : 'Заполните все позиции'}
          </CustomButton>
        </div>
      </div>
    </Div>
  );
};

export default CardSelector; 