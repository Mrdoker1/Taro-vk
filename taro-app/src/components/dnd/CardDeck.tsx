import React from 'react';
import { Text } from '@vkontakte/vkui';
import DraggableCard from './DraggableCard';

interface CardDeckProps {
  cards: {
    id: string;
    name: string;
    image?: string;
  }[];
  usedCardIds: string[];
  isShuffling?: boolean;
  backImageUrl?: string; // Упрощаем название
}

export const CardDeck: React.FC<CardDeckProps> = ({ cards, usedCardIds, isShuffling = false, backImageUrl }) => {
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
      {availableCards.length === 0 ? (
        <Text style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)' }}>
          Все карты колоды использованы
        </Text>
      ) : (
        <div style={{ 
          position: 'relative', 
          width: '150px', 
          height: '230px',
          animation: isShuffling ? 'shuffle 0.8s ease-in-out' : 'none'
        }}>
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
                background: backImageUrl ? `url(${backImageUrl})` : 'linear-gradient(135deg, #7B68EE, #4B0082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transform: `translate(${(i + 1) * 3}px, ${(i + 1) * 3}px)`,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                zIndex: 10 - i,
                animation: isShuffling ? `shuffleCard${i} 0.8s ease-in-out` : 'none'
              }}
            />
          ))}
          
          {/* Верхняя карта колоды для перетаскивания */}
          {topCard && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 15,
              width: '150px',
              height: '230px',
              borderRadius: '18px',
              overflow: 'hidden',
              animation: isShuffling ? 'shuffleTopCard 0.8s ease-in-out' : 'none',
              background: 'transparent',
            }}>
              <DraggableCard
                id={`draggable-${topCard.id}`}
                cardData={topCard}
                preview={false} // Явно указываем, что показываем рубашку
                backImageUrl={backImageUrl}
              />
            </div>
          )}
        </div>
      )}
      
      {/* CSS анимации для перетасовки */}
      <style>
        {`
          @keyframes shuffle {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-10px) rotate(-5deg); }
            50% { transform: translateX(10px) rotate(5deg); }
            75% { transform: translateX(-5px) rotate(-2deg); }
          }
          
          @keyframes shuffleTopCard {
            0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
            20% { transform: translateX(-15px) translateY(-5px) rotate(-8deg); }
            40% { transform: translateX(15px) translateY(-10px) rotate(8deg); }
            60% { transform: translateX(-8px) translateY(-5px) rotate(-4deg); }
            80% { transform: translateX(8px) translateY(-2px) rotate(4deg); }
          }
          
          @keyframes shuffleCard0 {
            0%, 100% { transform: translate(3px, 3px) rotate(0deg); }
            25% { transform: translate(-5px, 8px) rotate(-3deg); }
            50% { transform: translate(8px, -2px) rotate(3deg); }
            75% { transform: translate(0px, 5px) rotate(-1deg); }
          }
          
          @keyframes shuffleCard1 {
            0%, 100% { transform: translate(6px, 6px) rotate(0deg); }
            30% { transform: translate(-3px, 10px) rotate(-2deg); }
            60% { transform: translate(10px, 2px) rotate(2deg); }
            85% { transform: translate(3px, 8px) rotate(-1deg); }
          }
          
          @keyframes shuffleCard2 {
            0%, 100% { transform: translate(9px, 9px) rotate(0deg); }
            35% { transform: translate(0px, 12px) rotate(-1deg); }
            70% { transform: translate(12px, 5px) rotate(1deg); }
            90% { transform: translate(6px, 10px) rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CardDeck; 