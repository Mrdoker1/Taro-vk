import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { Group, Div, Title, Text, Button, Switch, IconButton } from '@vkontakte/vkui';
import { Icon24Settings } from '@vkontakte/icons';
import CardDeck from './CardDeck';
import DroppablePosition from './DroppablePosition';
import DraggableCard from './DraggableCard';

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
  onCardsSelected: (cards: { position: number; cardId: string; isReversed: boolean }[]) => void;
  onBack?: () => void;
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
  onCardsSelected,
  onBack
}) => {
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [activeDragCard, setActiveDragCard] = useState<{id: string; cardData: CardData} | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileTip, setShowMobileTip] = useState<boolean>(true);
  const [activeControlsPosition, setActiveControlsPosition] = useState<number | null>(null);
  
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
  
  // Обработчик окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
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
    
    // Сбрасываем активное перетаскивание
    setActiveDragCard(null);
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
  
  return (
    <Group>
      <Div style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Title level="2" style={{ textAlign: 'center', marginBottom: 8, fontSize: '20px' }}>
          Выберите карты для расклада
        </Title>
        <Text style={{ marginBottom: 4, textAlign: 'center', fontSize: '14px' }}>
          {`${spreadName} - ${deckName}`}
        </Text>
        
        {/* Инструкция для мобильных устройств */}
        {isMobile && showMobileTip && (
          <div style={{
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            margin: '4px 0 8px',
            fontSize: '13px'
          }}>
            <Text style={{ textAlign: 'center', fontWeight: 'medium' }}>
              Чтобы переместить карту, коснитесь её и удерживайте, затем перетащите на нужную позицию расклада
              <Button 
                mode="tertiary" 
                size="s" 
                onClick={() => setShowMobileTip(false)}
                style={{ marginLeft: 8 }}
              >
                ОК
              </Button>
            </Text>
          </div>
        )}
        
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Схема расклада - показываем ПЕРВЫМ */}
            <div>
              <Title level="3" style={{ marginBottom: 12, fontSize: '16px', textAlign: 'center' }}>
                Перетащите карты из колоды на позиции:
              </Title>
              
              {/* Добавляем информацию о трёх точках для управления картой */}
              {isMobile && (
                <Text style={{ 
                  fontSize: '13px', 
                  textAlign: 'center', 
                  color: 'var(--vkui--color_text_secondary)',
                  marginBottom: '12px' 
                }}>
                  Нажмите на три точки в углу карты для настройки карты
                </Text>
              )}
              
              {/* Уведомление о том, что размещенные карты нельзя перетаскивать */}
              <Text style={{ 
                fontSize: '13px', 
                textAlign: 'center', 
                color: 'var(--vkui--color_text_secondary)',
                marginBottom: '12px' 
              }}>
                Для изменения позиции карты воспользуйтесь кнопкой "Удалить" и выберите новую карту из колоды
              </Text>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px',
                justifyContent: 'center'
              }}>
                {positions.map(({ position, label }) => {
                  const selectedCard = selectedCards.find(card => card.position === position);
                  const isOccupied = !!selectedCard;
                  const showControls = activeControlsPosition === position;
                  
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
                              <Button 
                                mode="tertiary" 
                                size="s" 
                                appearance="negative"
                                onClick={() => {
                                  handleRemoveCard(position);
                                  setActiveControlsPosition(null);
                                }}
                                stretched
                                style={{ 
                                  padding: '2px 0',
                                  margin: '0 auto',
                                  maxWidth: '100px',
                                  minHeight: '28px',
                                  position: 'relative',
                                  zIndex: 55
                                }}
                              >
                                Удалить
                              </Button>
                            </AnimatedPanel>
                          </div>
                        )}
                      </DroppablePosition>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Колода карт - показываем ВТОРЫМ */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <CardDeck cards={cards} usedCardIds={usedCardIds} />
            </div>
          </div>
          
          {/* Оверлей для перетаскивания */}
          <DragOverlay>
            {activeDragCard && (
              <div style={{ width: '150px', height: '230px' }}>
                <DraggableCard
                  id={activeDragCard.id}
                  cardData={activeDragCard.cardData}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
        <Div style={{ display: 'flex', gap: '12px', marginTop: 16 }}>
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
    </Group>
  );
};

export default CardDndSelector; 