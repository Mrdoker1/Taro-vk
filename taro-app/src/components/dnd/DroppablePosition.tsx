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
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isOccupied
  });

  const style: React.CSSProperties = {
    width: '80px',
    height: '130px',
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
            fontSize: '11px',
            padding: '0 4px',
            fontWeight: isOver ? 'bold' : 'normal',
            zIndex: 5,
            margin: 0,
            lineHeight: 1.2,
            maxWidth: '70px',
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