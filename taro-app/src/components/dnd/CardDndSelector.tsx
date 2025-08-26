import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent, DragOverEvent, useSensor, useSensors, PointerSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { Text, IconButton } from '@vkontakte/vkui';
import { Icon24MoreHorizontal, Icon24Delete } from '@vkontakte/icons';
import CardDeck from './CardDeck';
import DroppablePosition from './DroppablePosition';
import DraggableCard from './DraggableCard';
import { CustomButton } from '../CustomButton';
import { CustomToggle } from '../CustomToggle';
import { InstructionsPanel } from '../InstructionsPanel';
import shuffleIcon from '../../assets/shuffle.svg';
import noImage from '../../assets/no-image.png'; 
import { BACKGROUND_BASE } from '../../constants/styles'; // Импортируем стили фона

interface CardDndSelectorProps {
  spreadName: string;
  spreadImageURL?: string; // Добавляем поле для URL изображения расклада
  deckName: string;
  cards: {
    id: string;
    name: string;
    imageUrl?: string; // Изменяем на imageUrl, как в Redux store
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
  onCardReturned?: (cardId: string) => void; // Новый callback для возврата карты в колоду
}

interface SelectedCard {
  position: number;
  cardId: string;
  isReversed: boolean;
}

interface CardData {
  id: string;
  name: string;
  imageUrl?: string; // Изменяем на imageUrl
}

export const CardDndSelector: React.FC<CardDndSelectorProps> = ({
  spreadName,
  spreadImageURL,
  deckName,
  cards,
  positions,
  spreadGrid,
  userQuestion,
  backImageUrl,
  onCardsSelected,
  onBack,
  onShuffleCards,
  onCardReturned
}) => {
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [activeDragCard, setActiveDragCard] = useState<{id: string; cardData: CardData} | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeControlsPosition, setActiveControlsPosition] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Функция для определения иконки расклада
  const getSpreadIcon = (spread?: { name: string; imageURL?: string }): string => {
    // Используем imageURL из данных бэкенда, если доступно
    // Иначе используем локальную иконку как fallback
    return spread?.imageURL || noImage;
  };
  
  // Определяем, является ли устройство мобильным и отслеживаем размер окна
  useEffect(() => {
    // Простая проверка типа устройства через User-Agent
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isTouchDevice || isMobileDevice);

    // Функция для обновления размера окна
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Функция для закрытия меню при клике вне его
    const handleClickOutside = (event: MouseEvent) => {
      if (activeControlsPosition !== null) {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown-button]') && !target.closest('[data-dropdown-menu]')) {
          setActiveControlsPosition(null);
        }
      }
    };

    // Добавляем слушатели событий
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    
    // Устанавливаем начальный размер
    setWindowWidth(window.innerWidth);

    // Очищаем слушатели при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeControlsPosition]);
  
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
    // Находим карту, которую удаляем
    const removedCard = selectedCards.find(card => card.position === position);
    
    // Обновляем состояние выбранных карт
    setSelectedCards(prev => prev.filter(card => card.position !== position));
    
    // Возвращаем удаленную карту в конец колоды через callback
    if (removedCard && onCardReturned) {
      onCardReturned(removedCard.cardId);
    }
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
        gap: windowWidth <= 768 ? '8px' : '12px',
        alignItems: 'center'
      }}>
        {spreadGrid.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            style={{ 
              display: 'flex', 
              gap: windowWidth <= 768 ? '8px' : '12px',
              justifyContent: 'center',
              flexWrap: windowWidth <= 768 ? 'wrap' : 'nowrap' // На мобильных разрешаем перенос
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
        alignItems: 'center',
        zIndex: showControls ? 10000 : 10 // Поднимаем позицию карты выше при открытом меню
      }}>
        <DroppablePosition
          id={`position-${position}`}
          label={label}
          position={position}
          isOccupied={isOccupied}
        >
          {selectedCard && (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative',
              zIndex: showControls ? 10000 : 1 // Поднимаем контейнер выше когда меню открыто
            }}>
              <DraggableCard
                id={`placed-${selectedCard.cardId}-${position}`}
                cardData={getCardById(selectedCard.cardId) || { id: selectedCard.cardId, name: 'Карта', imageUrl: undefined }}
                preview={true}
                isReversed={selectedCard.isReversed}
                disabled={true}
              />
              
              {/* Кнопка с иконкой троеточия для открытия выпадающего меню */}
              <div 
                ref={buttonRef}
                data-dropdown-button
                style={{ 
                  position: 'absolute', 
                  top: '6px', 
                  right: '6px', 
                  zIndex: '10'
                }}>
                <IconButton
                  onClick={() => toggleControls(position)}
                  style={{
                    backgroundColor: showControls ? 'rgba(0, 123, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '4px', // Делаем квадратным
                    padding: '6px',
                    width: '30px', // Фиксированная ширина для квадрата
                    height: '30px', // Фиксированная высота для квадрата
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <Icon24MoreHorizontal fill="#ffffff" width={18} height={18} />
                </IconButton>
              </div>
              
              {/* Выпадающее меню */}
              {showControls && (
                <div 
                  data-dropdown-menu
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    transform: 'translateX(50%)',
                    zIndex: 9999,
                    background: 'rgba(0, 0, 0, 0.9)',
                    borderRadius: '8px',
                    padding: windowWidth <= 768 ? '10px' : '12px',
                    minWidth: windowWidth <= 768 ? '140px' : '160px',
                    maxWidth: windowWidth <= 768 ? '160px' : '180px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: windowWidth <= 768 ? '10px' : '12px'
                  }}>
                  
                  {/* Блок с переключателем */}
                  <div style={{ 
                    width: '100%'
                  }}>
                    <CustomToggle
                      checked={selectedCard.isReversed || false}
                      onChange={() => handleCardReversedToggle(position)}
                      label={selectedCard.isReversed ? 'Перевёрнута' : 'Прямая'}
                    />
                  </div>
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={() => {
                      handleRemoveCard(position);
                      setActiveControlsPosition(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: windowWidth <= 768 ? '12px' : '13px',
                      fontWeight: 'medium',
                      padding: windowWidth <= 768 ? '8px 10px' : '10px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      textAlign: 'left',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Icon24Delete fill="white" width={16} height={16} />
                    Удалить карту
                  </button>
                </div>
              )}
              
              {/* Выпадающее меню теперь рендерится здесь */}
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
      padding: windowWidth <= 768 ? '16px' : '20px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        ...BACKGROUND_BASE,
        borderRadius: '12px',
        // overflow: 'hidden',
        position: 'relative',
        minHeight: '600px',
        padding: windowWidth <= 768 ? '24px 16px' : '32px'
      }}>
        {/* Заголовок секции */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          position: 'relative',
          flexDirection: 'row',
          textAlign: 'left'
        }}>
          <img
            src={getSpreadIcon({ name: spreadName, imageURL: spreadImageURL })}
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
              fontSize: windowWidth <= 480 ? '20px' : '24px',
              fontWeight: '400',
              margin: 0,
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}>
              Выбери карты для расклада
            </h1>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: windowWidth <= 480 ? '12px' : '14px',
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
          marginBottom: windowWidth <= 480 ? '12px' : '16px',
          position: 'relative'
        }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a73aa4a82442cd6022e0ae5e650a0c240ffa4f01"
            alt="Decorative element"
            style={{
              width: windowWidth <= 480 ? '70px' : '90px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Разделитель */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginBottom: windowWidth <= 768 ? '24px' : '32px'
        }} />
        
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Секция с вопросом */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              marginBottom: 16, 
              fontSize: '16px', 
              textAlign: 'center',
              color: '#ffffff',
              fontWeight: '300',
              margin: '0 0 16px 0',
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Твой вопрос
            </h3>
            
            {/* Отображаем вопрос пользователя */}
            {userQuestion && (
              <div style={{ 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: windowWidth <= 480 ? '18px' : '24px',
                  fontStyle: 'italic',
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  "{userQuestion}"
                </Text>
              </div>
            )}
          </div>

          {/* Основной контейнер с колодой, кнопками и позициями */}
          <div style={{ 
            display: 'flex', 
            gap: windowWidth <= 768 ? '16px' : '32px', 
            alignItems: 'center',
            flexDirection: windowWidth <= 768 ? 'column' : 'row', // Адаптивность
            flexWrap: 'wrap',
          }}>
            {/* Левая колонка - Колода карт, кнопки и позиции для карт */}
            <div style={{ 
              flex: '1',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: windowWidth <= 480 ? '12px' : '16px',
              width: '100%'
            }}>
              {/* Контейнер с колодой и кнопкой */}
              <div style={{
                display: 'flex',
                gap: windowWidth <= 768 ? '16px' : '32px',
                alignItems: 'center',
                flexDirection: windowWidth <= 768 ? 'column-reverse' : 'row',
                width: '100%',
                justifyContent: windowWidth <= 768 ? 'center' : 'flex-start'
              }}>
                {/* Блок с колодой и кнопками */}
                <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: windowWidth <= 480 ? '12px' : '16px',
                  flex: windowWidth <= 768 ? 'none' : '0 0 400px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <CardDeck cards={cards} usedCardIds={usedCardIds} isShuffling={isShuffling} backImageUrl={backImageUrl} />
                    
                    {/* Анимированная стрелка для подсказки драг-н-дропа */}
                    {cards.length > 0 && Object.keys(selectedCards).length === 0 && !isMobile && windowWidth > 768 && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        right: '-80px',
                        transform: 'translateY(-50%)',
                        fontSize: '32px',
                        animation: 'dragAndDropHint 2s ease-in-out infinite',
                        pointerEvents: 'none',
                        zIndex: 10,
                        color: 'rgba(227, 199, 122, 0.8)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}>
                        →
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
                      icon={shuffleIcon}
                    >
                      {isShuffling ? 'Перетасовываем...' : 'Перетасовать карты'}
                    </CustomButton>
                  )}
                  
                  {/* Панель с инструкциями */}
                  <InstructionsPanel windowWidth={windowWidth} />
                </div>

                {/* Позиции для карт - справа на десктопе, под кнопками на мобильных */}
                <div style={{ 
                  flex: '1',
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: windowWidth <= 768 ? '100%' : '300px',
                  width: '100%'
                }}>
                  {/* Контейнер для карт */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    margin: '0',
                    padding: '0'
                  }}>
                    {renderSpreadGrid()}
                  </div>
                </div>
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
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginTop: windowWidth <= 768 ? '24px' : '32px',
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
              width: windowWidth <= 480 ? '70px' : '90px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Кнопки действий под декоративным элементом */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          justifyContent: windowWidth <= 768 ? 'center' : 'flex-end',
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
          alignItems: 'center',
          marginTop: '24px'
        }}>
          <CustomButton 
            variant="secondary"
            size="m"
            onClick={onBack}
            style={{ 
              minWidth: '120px',
              width: windowWidth <= 480 ? '100%' : 'auto'
            }}
          >
            Назад
          </CustomButton>
          <CustomButton 
            variant="primary"
            size="m"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit()}
            style={{ 
              minWidth: '120px',
              width: windowWidth <= 480 ? '100%' : 'auto'
            }}
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