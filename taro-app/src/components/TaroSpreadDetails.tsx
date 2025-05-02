import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSpreadDetails } from '../store/slices/taroSpreadsSlice';
import { fetchDecks } from '../store/slices/taroDecksSlice';
import { Spinner, Button, Div, Title, Text, Group, Card, Select, FormItem } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

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
  const isComplexGrid = currentSpread?.grid && currentSpread.grid.length > 1;
  
  // Функция для определения размера карты в зависимости от количества карт и типа сетки
  const getCardSize = () => {
    if (isComplexGrid) {
      // Для сложных сеток (например, 3x3)
      return { width: 60, height: 90 };
    } else {
      // Для простых линейных раскладов
      return { width: 70, height: 100 };
    }
  };

  // Функция для перехода к гаданию с выбранным раскладом и колодой
  const handleStartReading = () => {
    if (selectedDeckId && currentSpread) {
      routeNavigator.push(`/reading/${spreadId}/${selectedDeckId}`);
    }
  };

  const cardSize = getCardSize();

  if (spreadLoading || decksLoading) {
    return <Spinner size="m" />;
  }

  if (spreadError) {
    return (
      <Div>
        <Text style={{ color: 'var(--vkui--color_text_negative)' }}>
          Ошибка: {spreadError}
        </Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад к раскладам
        </Button>
      </Div>
    );
  }

  if (!currentSpread) {
    return (
      <Div>
        <Text>Расклад не найден</Text>
        <Button onClick={onBack} size="m" mode="secondary" style={{ marginTop: 16 }}>
          Назад к раскладам
        </Button>
      </Div>
    );
  }

  const availableDecks = decks.filter(deck => deck.available);

  return (
    <Group>
      <Div>
        <Title level="1">{currentSpread.name}</Title>
        <Text style={{ marginTop: 8, marginBottom: 16 }}>
          {currentSpread.description}
        </Text>

        {currentSpread.questions && currentSpread.questions.length > 0 && (
          <>
            <Title level="3" style={{ marginTop: 16, marginBottom: 8 }}>
              Рекомендуемые вопросы:
            </Title>
            <div style={{ marginBottom: 16 }}>
              {currentSpread.questions.map((question, index) => (
                <Text key={index} style={{ marginBottom: 4 }}>
                  • {question}
                </Text>
              ))}
            </div>
          </>
        )}

        <Title level="3" style={{ marginTop: 16, marginBottom: 8 }}>
          Схема расклада:
        </Title>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: 16 
        }}>
          {currentSpread.grid.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px', 
                marginBottom: '8px',
                flexWrap: isComplexGrid ? 'nowrap' : 'wrap'
              }}
            >
              {row.map((position) => (
                <Card 
                  key={position} 
                  style={{ 
                    width: cardSize.width, 
                    height: cardSize.height, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'var(--vkui--color_background_secondary)',
                    position: 'relative'
                  }}
                >
                  <Text>{position}</Text>
                </Card>
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <Title level="3" style={{ marginBottom: 8 }}>
            Значения позиций:
          </Title>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px'
          }}>
            {Object.entries(currentSpread.meta).map(([position, meta]) => (
              <div key={position} style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text style={{ marginRight: 8, fontWeight: 'bold', minWidth: '24px' }}>
                  {position}:
                </Text>
                <Text>{meta.label}</Text>
              </div>
            ))}
          </div>
        </div>

        {currentSpread.available && !currentSpread.paid && (
          <FormItem top="Выберите колоду для гадания">
            <Select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              options={availableDecks.map(deck => ({
                label: deck.name,
                value: deck.id
              }))}
              placeholder="Выберите колоду"
              disabled={availableDecks.length === 0}
            />
          </FormItem>
        )}

        <Div style={{ display: 'flex', gap: '12px', marginTop: 20 }}>
          <Button size="m" mode="secondary" onClick={onBack} stretched>
            Назад
          </Button>
          <Button 
            size="m" 
            mode="primary" 
            onClick={handleStartReading}
            stretched
            disabled={!currentSpread.available || currentSpread.paid || !selectedDeckId || availableDecks.length === 0}
          >
            {currentSpread.paid 
              ? 'Платный расклад' 
              : availableDecks.length === 0 
                ? 'Нет доступных колод'
                : 'Начать гадание'
            }
          </Button>
        </Div>
      </Div>
    </Group>
  );
};

export default TaroSpreadDetails; 