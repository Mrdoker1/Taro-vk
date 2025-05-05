import React from 'react';
import { Title, Text } from '@vkontakte/vkui';
import DraggableCard from './DraggableCard';

interface CardDeckProps {
  cards: {
    id: string;
    name: string;
    image?: string;
  }[];
  usedCardIds: string[];
  title?: string;
}

export const CardDeck: React.FC<CardDeckProps> = ({ cards, usedCardIds, title = 'Колода карт' }) => {
  // Карты, которые еще не использованы
  const availableCards = cards.filter(card => !usedCardIds.includes(card.id));
  
  // Получаем первую доступную карту для отображения на верхушке колоды
  const topCard = availableCards.length > 0 ? availableCards[0] : null;
  
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Title level="3" style={{ textAlign: 'center', fontSize: '16px', marginBottom: '0' }}>{title}</Title>
      
      {availableCards.length === 0 ? (
        <Text style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)' }}>
          Все карты колоды использованы
        </Text>
      ) : (
        <div style={{ position: 'relative', width: '150px', height: '230px' }}>
          {/* Фоновые карты стопки */}
          {[...Array(Math.min(3, availableCards.length - 1))].map((_, i) => (
            <div 
              key={`stack-card-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '230px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7B68EE, #4B0082)',
                transform: `translate(${(i + 1) * 3}px, ${(i + 1) * 3}px)`,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                zIndex: 10 - i
              }}
            />
          ))}
          
          {/* Остаток колоды (текстовое отображение) */}
          {availableCards.length > 4 && (
            <div style={{
              position: 'absolute',
              bottom: '-28px',
              right: '0',
              zIndex: 15,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              Осталось: {availableCards.length}
            </div>
          )}
          
          {/* Верхняя карта колоды для перетаскивания */}
          {topCard && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 15,
              width: '150px',
              height: '230px',
            }}>
              <DraggableCard
                id={`draggable-${topCard.id}`}
                cardData={topCard}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardDeck; 