import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Text } from '@vkontakte/vkui';

interface DroppablePositionProps {
  id: string;
  label: string;
  position?: number; // Добавляем номер позиции
  children?: React.ReactNode;
  isOccupied?: boolean;
}

export const DroppablePosition: React.FC<DroppablePositionProps> = ({ 
  id, 
  label, 
  position,
  children, 
  isOccupied = false 
}) => {
  // Адаптивные размеры в зависимости от ширины экрана
  const getCardSize = () => {
    if (typeof window === 'undefined') return { width: '60px', height: '95px' };
    
    const width = window.innerWidth;
    if (width <= 480) {
      return { width: '50px', height: '80px' }; // Очень маленькие для телефонов
    } else if (width <= 768) {
      return { width: '60px', height: '95px' }; // Средние для планшетов
    } else if (width <= 900) {
      return { width: '65px', height: '105px' }; // Промежуточный размер
    } else if (width <= 1024) {
      return { width: '70px', height: '110px' }; // Больше для небольших десктопов
    } else {
      return { width: '80px', height: '125px' }; // Максимальные для больших экранов
    }
  };

  const cardSize = getCardSize();
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isOccupied
  });

  const style: React.CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: '8px',
    border: isOver 
      ? '3px dashed #FFD700' 
      : isOccupied 
        ? '2px solid #FFD700' 
        : '2px dashed var(--vkui--color_icon_secondary)',
    backgroundColor: isOver ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    transition: 'background-color 0.15s, border 0.15s',
    position: 'relative',
    touchAction: 'none',
  };

  const pulseAnimation = isOver ? {
    animation: 'pulse 1.2s infinite',
  } : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div 
        ref={setNodeRef} 
        style={{ ...style, ...pulseAnimation }}
        onTouchMove={(e) => {
          if (isOver) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
                {!children && (
          <Text style={{
            color: isOver ? '#FFD700' : 'var(--vkui--color_text_secondary)', 
            textAlign: 'center',
            position: 'absolute',
            fontSize: typeof window !== 'undefined' && window.innerWidth <= 480 ? '9px' : '10px',
            padding: '0 2px',
            fontWeight: isOver ? 'bold' : 'normal',
            zIndex: 5,
            margin: 0,
            lineHeight: 1.1,
            maxWidth: `calc(${cardSize.width} - 8px)`,
            wordWrap: 'break-word'
          }}>
            {isOccupied ? 'Занята' : (position ? `${position}. ${label}` : label)}
          </Text>
        )}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          zIndex: 5,
        }}>
          {children}
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default DroppablePosition; 