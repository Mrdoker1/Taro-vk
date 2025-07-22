import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent, DragOverEvent, useSensor, useSensors, PointerSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { Text, Switch, IconButton } from '@vkontakte/vkui';
import { Icon24Settings } from '@vkontakte/icons';
import CardDeck from './CardDeck';
import DroppablePosition from './DroppablePosition';
import DraggableCard from './DraggableCard';
import { CustomButton } from '../CustomButton';
import { InstructionsPanel } from '../InstructionsPanel';

interface CardDndSelectorProps {
  spreadName: string;
  deckName: string;
  cards: {
    id: string;
    name: string;
    image?: string;
  }[];
  positions: {
    position: number;
    label: string;
  }[];
  spreadGrid?: number[][];  // Добавляем структуру сетки расклада
  userQuestion?: string;
  backImageUrl?: string; // Упрощаем название
  onCardsSelected: (cards: { position: number; cardId: string; isReversed: boolean }[]) => void;
  onBack?: () => void;
  onShuffleCards?: () => void;
}

interface SelectedCard {
  position: number;
  cardId: string;
  isReversed: boolean;
}

interface CardData {
  id: string;
  name: string;
  image?: string;
}

const AnimatedPanel: React.FC<{
  visible: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ visible, children, style }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const timeout = setTimeout(() => {
        setMounted(false);
      }, 300); // время анимации
      return () => clearTimeout(timeout);
    }
  }, [visible]);
  
  if (!mounted && !visible) {
    return null;
  }
  
  return (
    <div
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  );
};

export const CardDndSelector: React.FC<CardDndSelectorProps> = ({
  spreadName,
  deckName,
  cards,
  positions,
  spreadGrid = [[1]], // Дефолтное значение для одной карты
  userQuestion = '',
  backImageUrl,
  onCardsSelected,
  onBack,
  onShuffleCards
}) => {
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [activeDragCard, setActiveDragCard] = useState<{id: string; cardData: CardData} | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeControlsPosition, setActiveControlsPosition] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  
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
  
  // Определяем, является ли устройство мобильным
  useEffect(() => {
    // Простая проверка типа устройства через User-Agent
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isTouchDevice || isMobileDevice);
  }, []);
  
  // Инициализация сенсоров для перетаскивания - улучшенные настройки для мобильных устройств
  const sensors = useSensors(
    // Используем MouseSensor для десктопов с мышью
    useSensor(MouseSensor, {
      // Начинаем перетаскивание после нажатия кнопки мыши
      activationConstraint: {
        distance: 5, // минимальное расстояние для активации (px)
      },
    }),
    // Используем TouchSensor для мобильных устройств
    useSensor(TouchSensor, {
      // Более чувствительные настройки для сенсорных экранов
      activationConstraint: {
        delay: 0, // нет задержки
        tolerance: 0, // нет минимального порога перемещения
      },
    }),
    // PointerSensor работает и с мышью и с тачем
    useSensor(PointerSensor, {
      // Более чувствительные настройки для комбинированных устройств
      activationConstraint: {
        distance: 3, // меньшее расстояние для активации
      },
    })
  );
  
  // Обработчик начала перетаскивания
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id, data } = active;
    
    setActiveDragCard({
      id: String(id),
      cardData: data.current?.cardData as CardData || { id: '', name: '' }
    });
  };
  
  // Обработчик при наведении карты на зону
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setActiveDropTarget(over ? String(over.id) : null);
  };
  
  // Обработчик окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Сбрасываем активную зону
    setActiveDropTarget(null);
    
    if (over && active.data.current) {
      const cardData = active.data.current.cardData;
      const draggedCardId = cardData.id;
      const activeId = active.id as string;
      const dropTargetId = over.id as string;
      
      // Проверяем, перетаскивается ли карта из колоды или уже размещенная карта
      const isDraggingFromDeck = activeId.startsWith('draggable-');
      
      // Разрешаем перетаскивание только если карта из колоды
      if (!isDraggingFromDeck) {
        setActiveDragCard(null);
        return;
      }
      
      // Парсим идентификатор позиции из ID дропзоны
      const positionMatch = dropTargetId.match(/^position-(\d+)$/);
      if (positionMatch && positionMatch[1]) {
        const position = parseInt(positionMatch[1], 10);
        
        // Проверяем, не занята ли позиция
        const existingCardIndex = selectedCards.findIndex(card => card.position === position);
        if (existingCardIndex >= 0) {
          // Если позиция уже занята, заменяем карту
          setSelectedCards(prev => {
            const newCards = [...prev];
            newCards[existingCardIndex] = {
              position,
              cardId: draggedCardId,
              isReversed: false
            };
            return newCards;
          });
        } else {
          // Если позиция свободна, добавляем новую карту
          setSelectedCards(prev => [
            ...prev,
            {
              position,
              cardId: draggedCardId,
              isReversed: false
            }
          ]);
        }
      }
    }
    
    // Сбрасываем активное перетаскивание и активную зону
    setActiveDragCard(null);
    setActiveDropTarget(null);
  };
  
  // Функция для переключения состояния "перевернутая карта"
  const handleCardReversedToggle = (position: number) => {
    setSelectedCards(prev => {
      const newCards = [...prev];
      const existingCardIndex = newCards.findIndex(card => card.position === position);
      
      if (existingCardIndex >= 0) {
        newCards[existingCardIndex].isReversed = !newCards[existingCardIndex].isReversed;
      }
      
      return newCards;
    });
  };
  
  // Функция для удаления карты из позиции
  const handleRemoveCard = (position: number) => {
    setSelectedCards(prev => prev.filter(card => card.position !== position));
  };
  
  // Проверка готовности к отправке результатов
  const isReadyToSubmit = () => {
    return positions.length > 0 && selectedCards.length === positions.length;
  };
  
  // Функция для отправки выбранных карт
  const handleSubmit = () => {
    if (isReadyToSubmit()) {
      onCardsSelected(selectedCards);
    }
  };
  
  // Получение используемых ID карт
  const usedCardIds = selectedCards.map(card => card.cardId);
  
  // Получение карты по ID
  const getCardById = (cardId: string) => {
    return cards.find(card => card.id === cardId) || null;
  };
  
  // Функция для переключения отображения элементов управления
  const toggleControls = (position: number) => {
    if (activeControlsPosition === position) {
      setActiveControlsPosition(null);
    } else {
      setActiveControlsPosition(position);
    }
  };

  // Функция для рендеринга сетки карт в соответствии со структурой расклада
  const renderSpreadGrid = () => {
    if (!spreadGrid || spreadGrid.length === 0) {
      // Фоллбэк: если нет сетки, отображаем позиции в ряд
      return (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {positions.map(({ position, label }) => {
            const selectedCard = selectedCards.find(card => card.position === position);
            const isOccupied = !!selectedCard;
            const showControls = activeControlsPosition === position;
            
            return renderCardPosition(position, label, selectedCard, isOccupied, showControls);
          })}
        </div>
      );
    }

    // Рендерим сетку согласно структуре расклада
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: isMobile ? '8px' : '12px',
        alignItems: 'center'
      }}>
        {spreadGrid.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            style={{ 
              display: 'flex', 
              gap: isMobile ? '8px' : '12px',
              justifyContent: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap' // На мобильных разрешаем перенос
            }}
          >
            {row.map((position) => {
              const positionData = positions.find(p => p.position === position);
              if (!positionData) return null;
              
              const selectedCard = selectedCards.find(card => card.position === position);
              const isOccupied = !!selectedCard;
              const showControls = activeControlsPosition === position;
              
              return renderCardPosition(position, positionData.label, selectedCard, isOccupied, showControls);
            })}
          </div>
        ))}
      </div>
    );
  };

  // Функция для рендеринга отдельной позиции карты
  const renderCardPosition = (position: number, label: string, selectedCard: SelectedCard | undefined, isOccupied: boolean, showControls: boolean) => {
    return (
      <div key={`position-${position}`} style={{ 
        marginBottom: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <DroppablePosition
          id={`position-${position}`}
          label={label}
          isOccupied={isOccupied}
        >
          {selectedCard && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <DraggableCard
                id={`placed-${selectedCard.cardId}-${position}`}
                cardData={getCardById(selectedCard.cardId) || { id: selectedCard.cardId, name: 'Карта' }}
                preview={true}
                isReversed={selectedCard.isReversed}
                disabled={true}
              />
              
              {/* Кнопка с иконкой настроек для открытия панели управления */}
              <div style={{ 
                position: 'absolute', 
                top: '6px', 
                right: '6px', 
                zIndex: 60,
              }}>
                <IconButton
                  onClick={() => toggleControls(position)}
                  style={{
                    backgroundColor: showControls ? 'rgba(0, 123, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '50%',
                    padding: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <Icon24Settings fill="#ffffff" width={18} height={18} />
                </IconButton>
              </div>
              
              {/* Панель управления с анимацией */}
              <AnimatedPanel
                visible={showControls}
                style={{ 
                  position: 'absolute', 
                  bottom: '0', 
                  left: '0', 
                  right: '0',
                  padding: '8px 6px 6px',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 50
                }}
              >
                {/* Блок с переключателем и подписью */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '6px',
                  borderRadius: '6px'
                }}>
                  <Switch 
                    checked={selectedCard.isReversed}
                    onChange={() => {
                      handleCardReversedToggle(position);
                    }}
                    style={{ position: 'relative', zIndex: 55 }}
                  />
                  <Text style={{ 
                    color: 'white', 
                    marginLeft: '8px', 
                    fontSize: '13px', 
                    fontWeight: 'medium',
                    position: 'relative',
                    zIndex: 55
                  }}>
                    {selectedCard.isReversed ? 'Перевёрнута' : 'Прямая'}
                  </Text>
                </div>
                
                {/* Кнопка удаления */}
                <CustomButton 
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    handleRemoveCard(position);
                    setActiveControlsPosition(null);
                  }}
                  style={{ 
                    width: '100px',
                    position: 'relative',
                    zIndex: 55
                  }}
                >
                  Удалить
                </CustomButton>
              </AnimatedPanel>
            </div>
          )}
        </DroppablePosition>
      </div>
    );
  };

  // Функция для перетасовки с анимацией
  const handleShuffle = () => {
    setIsShuffling(true);
    
    // Запускаем анимацию на 800ms, затем вызываем перетасовку
    setTimeout(() => {
      if (onShuffleCards) {
        onShuffleCards();
      }
      setIsShuffling(false);
    }, 800);
  };
  
  return (
    <div style={{ 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '600px',
        padding: '32px'
      }}>
        {/* Заголовок секции */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <img
            src={getSpreadIcon(spreadName)}
            alt="Tarot spread icon"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '400',
              margin: 0,
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              Выберите карты для расклада
            </h1>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '14px',
              marginTop: '4px',
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              {`${spreadName} - ${deckName}`}
            </Text>
          </div>
        </div>

        {/* Декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative'
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
        
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            alignItems: 'center',
            flexDirection: 'row' // Всегда горизонтальное расположение
          }}>
            {/* Левая колонка - Вопрос и колода */}
            <div style={{ 
              flex: isMobile ? '1' : '0 0 300px',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px' 
            }}>
              {/* Секция с вопросом */}
              <div>
                <h3 style={{ 
                  marginBottom: 16, 
                  fontSize: '16px', 
                  textAlign: 'center',
                  color: '#ffffff',
                  fontWeight: '300',
                  margin: '0 0 16px 0',
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  Ваш вопрос
                </h3>
                
                {/* Отображаем вопрос пользователя */}
                {userQuestion && (
                  <div style={{ 
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}>
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '24px',
                      fontStyle: 'italic',
                      fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                    }}>
                      "{userQuestion}"
                    </Text>
                  </div>
                )}
              </div>

              {/* Колода карт */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '16px'
              }}>
                <div style={{ position: 'relative' }}>
                  <CardDeck cards={cards} usedCardIds={usedCardIds} isShuffling={isShuffling} backImageUrl={backImageUrl} />
                  
                  {/* Анимированная рука для подсказки драг-н-дропа */}
                  {cards.length > 0 && Object.keys(selectedCards).length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      right: '-80px',
                      transform: 'translateY(-50%)',
                      fontSize: '28px',
                      animation: 'dragAndDropHint 3s ease-in-out infinite',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}>
                      <div style={{ 
                        position: 'relative',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}>
                        {/* Карта */}
                        <span style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          zIndex: 1
                        }}>
                          🃏
                        </span>
                        {/* Рука поверх карты */}
                        <span style={{
                          position: 'relative',
                          top: '-2px',
                          left: '8px',
                          zIndex: 2
                        }}>
                          🤏
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Кнопка перетасовки карт */}
                {onShuffleCards && (
                  <CustomButton 
                    variant="secondary"
                    size="m"
                    onClick={handleShuffle}
                    disabled={isShuffling}
                  >
                    {isShuffling ? '🔄 Перетасовываем...' : '🔀 Перетасовать карты'}
                  </CustomButton>
                )}
                
                {/* Панель с инструкциями */}
                <InstructionsPanel />
              </div>
            </div>

            {/* Правая колонка - Позиции для карт */}
            <div style={{ 
              flex: '1',
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%' // Полная высота
            }}>
              {/* Добавляем информацию о трёх точках для управления картой */}
              {isMobile && (
                <Text style={{ 
                  fontSize: '13px', 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '12px' 
                }}>
                  Перетащите карты сюда
                </Text>
              )}
              
              {/* Контейнер для карт с фиксированной шириной */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%', // Высота на весь доступный контейнер
                width: '100%',
                margin: '0',
                padding: '0'
              }}>
                {renderSpreadGrid()}
              </div>
            </div>
          </div>
          
          {/* Оверлей для перетаскивания */}
          <DragOverlay>
            {activeDragCard && (
              <div style={{ 
                width: activeDropTarget ? '100px' : '150px', // Изначально размер колоды, при наведении - размер зоны
                height: activeDropTarget ? '150px' : '230px',
                transform: 'scale(1)', // Убираем дополнительное масштабирование
                transition: 'all 0.2s ease', // Плавная анимация изменения размера
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))', // Добавляем тень для объёма
                borderRadius: '18px',
                overflow: 'hidden',
                zIndex: 9999
              }}>
                <DraggableCard
                  id={activeDragCard.id}
                  cardData={activeDragCard.cardData}
                  preview={false} // Явно указываем, что показываем рубашку при перетаскивании
                  backImageUrl={backImageUrl}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
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

        {/* Кнопки действий под декоративным элементом */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <CustomButton 
            variant="secondary"
            size="m"
            onClick={onBack}
            style={{ minWidth: '120px' }}
          >
            Назад
          </CustomButton>
          <CustomButton 
            variant="primary"
            size="m"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit()}
            style={{ minWidth: '120px' }}
          >
            Продолжить
          </CustomButton>
        </div>
      </div>
      
      {/* Добавляем невидимый элемент для блокировки scroll во время drag&drop на мобильных */}
      {activeDragCard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            touchAction: 'none'
          }}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
};

export default CardDndSelector; 