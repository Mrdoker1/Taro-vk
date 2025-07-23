import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@vkontakte/vkui';

interface DraggableCardProps {
  id: string;
  cardData: {
    id: string;
    name: string;
    image?: string;
  };
  preview?: boolean;
  isReversed?: boolean;
  disabled?: boolean;
  backImageUrl?: string; // Упрощаем название - это рубашка карты
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ 
  id, 
  cardData, 
  preview = false,
  isReversed = false,
  disabled = false,
  backImageUrl
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { cardData },
    disabled: disabled
  });

  // Создаем стили для перетаскиваемой карты с улучшениями для мобильного взаимодействия
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0 : 1, // Полностью скрываем оригинальную карту при перетаскивании
    cursor: disabled ? 'default' : 'grab',
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: preview ? 'transparent' : 'var(--vkui--color_background_secondary)',
    boxShadow: isDragging ? '0px 5px 15px rgba(0, 0, 0, 0.3)' : undefined,
    // Фиксируем z-index для карты, чтобы не перекрывать элементы управления
    zIndex: isDragging ? 1000 : (preview ? 10 : 1),
    // Отключаем переходную анимацию для предотвращения визуального "возврата" карты
    transition: undefined,
    touchAction: 'none', // Важно для тач-устройств - отключаем нативный скролл при перетаскивании
    WebkitTouchCallout: 'none', // Отключаем контекстное меню на iOS
    WebkitUserSelect: 'none',
    userSelect: 'none',
  };

  // Добавляем поворот для перевернутой карты
  const cardRotation = preview && isReversed ? {
    transform: 'rotate(180deg)',
  } : {};

  // Стиль обратной стороны карты
  const backStyle: React.CSSProperties = {
    background: backImageUrl ? `url(${backImageUrl})` : 'linear-gradient(135deg, #7B68EE, #4B0082)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '8px',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    overflow: 'hidden'
  };

  // Маленький индикатор перевернутой карты в левом нижнем углу (всегда виден)
  const miniReversedIndicator = preview && isReversed ? (
    <div style={{
      position: 'absolute',
      bottom: '5px',
      left: '5px',
      width: '15px',
      height: '15px',
      backgroundColor: 'rgba(255, 59, 48, 0.8)',
      borderRadius: '50%',
      zIndex: 25,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: '12px', color: 'white', transform: 'rotate(180deg)' }}>↑</span>
    </div>
  ) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // Добавляем обработчики touch-событий для лучшей работы на мобильных устройствах
      onTouchStart={(e) => {
        // Предотвращаем скролл во время перетаскивания
        e.stopPropagation();
      }}
    >
      <Card mode="shadow" style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        ...cardRotation 
      }}>
        {preview ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cardData.image ? (
              <img 
                src={cardData.image} 
                alt={cardData.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                draggable={false} // Отключаем нативное перетаскивание изображений
              />
            ) : (
              <div style={{ 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: 'grey',
                color: 'white',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}>
                {cardData.name}
              </div>
            )}
          </div>
        ) : (
          <div style={backStyle}>
            {!backImageUrl && (
              <div style={{ transform: 'rotate(45deg)', fontSize: '2rem' }}>∞</div>
            )}
          </div>
        )}
      </Card>
      {miniReversedIndicator}
    </div>
  );
};

export default DraggableCard; 