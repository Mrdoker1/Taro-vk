import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Text } from '@vkontakte/vkui';

interface DroppablePositionProps {
  id: string;
  label: string;
  children?: React.ReactNode;
  isOccupied?: boolean;
}

export const DroppablePosition: React.FC<DroppablePositionProps> = ({ 
  id, 
  label, 
  children, 
  isOccupied = false 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isOccupied
  });

  const style: React.CSSProperties = {
    width: '150px',
    height: '230px',
    borderRadius: '8px',
    border: isOver 
      ? '3px dashed var(--vkui--color_accent)' 
      : isOccupied 
        ? '2px solid var(--vkui--color_background_accent)' 
        : '2px dashed var(--vkui--color_icon_secondary)',
    backgroundColor: isOver ? 'rgba(0, 0, 255, 0.08)' : 'transparent',
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
      <Text weight="1" style={{ textAlign: 'center', marginBottom: '2px', fontSize: '14px' }}>
        {label}
      </Text>
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
            color: isOver ? 'var(--vkui--color_accent)' : 'var(--vkui--color_text_secondary)', 
            textAlign: 'center',
            position: 'absolute',
            fontSize: '12px',
            padding: '0 4px',
            fontWeight: isOver ? 'bold' : 'normal',
            zIndex: 5
          }}>
            {isOccupied ? 'Позиция занята' : 'Перетащите карту сюда'}
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
              box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(0, 123, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default DroppablePosition; 