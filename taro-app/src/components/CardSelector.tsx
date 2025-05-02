import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDeckDetails } from '../store/slices/taroDecksSlice';
import { fetchSpreadDetails } from '../store/slices/taroSpreadsSlice';
import { Spinner, Button, Div, Title, Text, Group, Card, Select, Switch, FormItem } from '@vkontakte/vkui';

interface CardSelectorProps {
  spreadId: string;
  deckId: string;
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
  onCardsSelected,
  onBack 
}) => {
  const dispatch = useAppDispatch();
  const { currentSpread } = useAppSelector((state) => state.taroSpreads);
  const { currentDeck, deckLoading, deckError } = useAppSelector((state) => state.taroDecks);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [allPositions, setAllPositions] = useState<number[]>([]);

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

  if (deckLoading) {
    return <Spinner size="m" />;
  }

  if (deckError) {
    return (
      <Div>
        <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
          Ошибка: {deckError}
        </Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад
        </Button>
      </Div>
    );
  }

  if (!currentDeck || !currentSpread) {
    return (
      <Div>
        <Text>Не удалось загрузить данные колоды или расклада</Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад
        </Button>
      </Div>
    );
  }

  // Получаем карты из колоды, если они есть
  const cards = currentDeck.cards || [];

  return (
    <Group>
      <Div>
        <Title level="1">Выбор карт для расклада</Title>
        <Text style={{ marginTop: 8, marginBottom: 16 }}>
          {`${currentSpread.name} - ${currentDeck.name}`}
        </Text>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <Title level="3" style={{ marginBottom: 16 }}>
            Выберите карты для каждой позиции:
          </Title>

          {allPositions.map(position => {
            const selectedCard = selectedCards.find(card => card.position === position);
            const positionLabel = currentSpread.meta[position.toString()]?.label || `Позиция ${position}`;
            
            return (
              <Card key={position} mode="shadow" style={{ 
                marginBottom: 16, 
                padding: 16,
                backgroundColor: 'var(--vkui--color_background_content)'
              }}>
                <Title level="3" style={{ marginBottom: 8 }}>
                  {positionLabel}
                </Title>
                
                <FormItem top="Выберите карту">
                  <Select
                    value={selectedCard?.cardId || ''}
                    onChange={(e) => handleCardSelect(position, e.target.value)}
                    options={cards.map(card => ({
                      label: card.name,
                      value: card.id
                    }))}
                    placeholder="Выберите карту для этой позиции"
                  />
                </FormItem>

                {selectedCard && (
                  <FormItem>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Switch 
                        checked={selectedCard.isReversed}
                        onChange={() => handleCardReversedToggle(position, !selectedCard.isReversed)}
                      />
                      <Text style={{ marginLeft: 12 }}>Карта в перевернутом положении</Text>
                    </div>
                  </FormItem>
                )}
              </Card>
            );
          })}
        </div>

        <Div style={{ display: 'flex', gap: '12px', marginTop: 20 }}>
          <Button size="m" mode="secondary" onClick={onBack} stretched>
            Назад
          </Button>
          <Button 
            size="m" 
            mode="primary" 
            onClick={handleSubmit}
            stretched
            disabled={!isReadyToSubmit()}
          >
            Продолжить
          </Button>
        </Div>
      </Div>
    </Group>
  );
};

export default CardSelector; 