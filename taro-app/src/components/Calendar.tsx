import React, { useState, useEffect } from 'react';
import {
  Div,
  Text,
  Title,
  Card,
  Button,
  Textarea,
  Group,
  Badge,
  IconButton,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  ModalRoot
} from '@vkontakte/vkui';
import { Icon24ChevronLeft, Icon24ChevronRight, Icon28CalendarOutline, Icon24View, Icon24Delete, Icon24Dismiss } from '@vkontakte/icons';
import { useAppDispatch, useAppSelector } from '../store';
import calendarSpreadIcon from '../assets/calendar-spread.svg';
import calendarAffirmIcon from '../assets/calendar-affirm.svg';
import {
  setSelectedDate,
  loadCalendarData,
  updateCalendarNote,
  deleteCalendarNote,
  removeCalendarActivity,
  CalendarActivity
} from '../store/slices/calendarSlice';
import { ActivityContentDisplay } from './ActivityContentDisplay';
import { CustomButton } from './CustomButton';

interface CalendarProps {
  activeModal?: string;
  setActiveModal?: (modal: string | null) => void;
}

export const Calendar: React.FC<CalendarProps> = () => {
  const dispatch = useAppDispatch();
  const { daysData, selectedDate, loading, error } = useAppSelector((state) => state.calendar);
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<{ activity: CalendarActivity; date: string } | null>(null);

  useEffect(() => {
    dispatch(loadCalendarData());
    
    // Устанавливаем текущую дату как выбранную по умолчанию
    const today = formatDate(new Date());
    dispatch(setSelectedDate(today));
  }, [dispatch]);

  useEffect(() => {
    if (selectedDate) {
      const dayData = daysData[selectedDate];
      setNoteText(dayData?.note?.content || '');
    }
  }, [selectedDate, daysData]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (dateStr: string) => {
    dispatch(setSelectedDate(dateStr));
  };

  const handleSaveNote = async () => {
    if (!selectedDate) return;

    if (noteText.trim()) {
      await dispatch(updateCalendarNote(selectedDate, {
        id: `note_${selectedDate}_${Date.now()}`,
        content: noteText.trim(),
        timestamp: Date.now(),
      }));
    } else {
      await dispatch(deleteCalendarNote(selectedDate));
    }
    setIsEditingNote(false);
  };

  const handleCancelEdit = () => {
    const dayData = selectedDate ? daysData[selectedDate] : null;
    setNoteText(dayData?.note?.content || '');
    setIsEditingNote(false);
  };

  const handleViewActivity = (activity: CalendarActivity) => {
    setSelectedActivity(activity);
    setActiveModal('activity-details');
  };

  const handleDeleteActivity = (activity: CalendarActivity, date: string) => {
    setActivityToDelete({ activity, date });
    setActiveModal('delete-confirm');
  };

  const confirmDeleteActivity = async () => {
    if (activityToDelete) {
      await dispatch(removeCalendarActivity(activityToDelete.date, activityToDelete.activity.id));
      setActivityToDelete(null);
      setActiveModal(null);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedActivity(null);
    setActivityToDelete(null);
  };

  const getActivityIcon = (type: CalendarActivity['type'], size: 'small' | 'normal' = 'normal') => {
    const iconSize = size === 'small' ? '32px' : '40px';
    
    switch (type) {
      case 'tarot_reading':
        return (
          <img 
            src={calendarSpreadIcon} 
            alt="Расклад Таро" 
            style={{ width: iconSize, height: iconSize }}
          />
        );
      case 'affirmation':
        return (
          <img 
            src={calendarAffirmIcon} 
            alt="Аффирмация" 
            style={{ width: iconSize, height: iconSize }}
          />
        );
      default:
        return (
          <div style={{ 
            fontSize: size === 'small' ? '20px' : '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: iconSize, 
            height: iconSize 
          }}>
            📝
          </div>
        );
    }
  };

  const getActivityTypeLabel = (type: CalendarActivity['type']) => {
    switch (type) {
      case 'tarot_reading':
        return 'Расклад Таро';
      case 'affirmation':
        return 'Аффирмация';
      default:
        return 'Активность';
    }
  };

  const formatActivityTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getActivityDetails = (activity: CalendarActivity) => {
    if (activity.type === 'tarot_reading') {
      // Для расклада Таро показываем summary (колода и карты)
      return activity.summary;
    } else if (activity.type === 'affirmation') {
      // Для аффирмации пытаемся извлечь структурированную информацию
      try {
        if (activity.fullContent) {
          const data = JSON.parse(activity.fullContent);
          if (data && typeof data === 'object' && Array.isArray(data.sections)) {
            // Если есть структурированные данные аффирмации с sections
            const parts = data.sections.map((section: { title: string; text: string }) => {
              const shortText = section.text.length > 40 
                ? section.text.substring(0, 40) + '...' 
                : section.text;
              return `${section.title}: ${shortText}`;
            });
            
            const text = parts.join(' | ');
            return text.length > 80 ? text.substring(0, 80) + '...' : text;
          }
        }
      } catch (e) {
        // Если не удается парсить, используем summary
        console.error('Error parsing affirmation data:', e);
      }
      
      // Fallback к summary или обрезанному тексту
      const content = activity.summary;
      return content.length > 80 ? content.substring(0, 80) + '...' : content;
    }
    return activity.summary;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectedDateData = selectedDate ? daysData[selectedDate] : null;
  const hasActivities = selectedDateData?.activities && selectedDateData.activities.length > 0;
  const hasNote = selectedDateData?.note;

  const getDayMarkers = (date: Date): React.ReactNode => {
    const dateStr = formatDate(date);
    const dayData = daysData[dateStr];
    
    if (!dayData) return null;
    
    const hasNote = !!dayData.note;
    const hasTarotReading = dayData.activities.some(activity => activity.type === 'tarot_reading');
    const hasAffirmation = dayData.activities.some(activity => activity.type === 'affirmation');
    const hasOtherActivity = dayData.activities.some(activity => activity.type === 'other');
    
    const markers = [];
    
    // Определяем позиции для маркеров
    let markerIndex = 0;
    const markerSize = 4;
    const markerSpacing = 5;
    
    if (hasTarotReading) {
      markers.push(
        <div
          key="tarot"
          style={{
            position: 'absolute',
            top: '2px',
            right: `${2 + markerIndex * markerSpacing}px`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            backgroundColor: '#9c27b0', // Фиолетовый для Таро
            zIndex: 1
          }}
        />
      );
      markerIndex++;
    }
    
    if (hasAffirmation) {
      markers.push(
        <div
          key="affirmation"
          style={{
            position: 'absolute',
            top: '2px',
            right: `${2 + markerIndex * markerSpacing}px`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            backgroundColor: '#ff9800', // Оранжевый для аффирмаций
            zIndex: 1
          }}
        />
      );
      markerIndex++;
    }
    
    if (hasNote) {
      markers.push(
        <div
          key="note"
          style={{
            position: 'absolute',
            top: '2px',
            right: `${2 + markerIndex * markerSpacing}px`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            backgroundColor: '#4caf50', // Зеленый для заметок
            zIndex: 1
          }}
        />
      );
      markerIndex++;
    }
    
    if (hasOtherActivity) {
      markers.push(
        <div
          key="other"
          style={{
            position: 'absolute',
            top: '2px',
            right: `${2 + markerIndex * markerSpacing}px`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            backgroundColor: '#2196f3', // Синий для других активностей
            zIndex: 1
          }}
        />
      );
    }
    
    return markers.length > 0 ? <>{markers}</> : null;
  };

  if (loading) {
    return (
      <Div style={{ padding: '32px 0', textAlign: 'center' }}>
        <Text>Загрузка календаря...</Text>
      </Div>
    );
  }

  if (error) {
    return (
      <Div style={{ padding: '16px' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </Div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '16px',
        width: '100%',
        minHeight: '400px'
      }}>
      {/* Левая часть - Календарь и обозначения (50%) */}
      <div style={{
        flex: '1',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '16px'
      }}>
        {/* Calendar Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <IconButton onClick={() => navigateMonth('prev')}>
            <Icon24ChevronLeft />
          </IconButton>
          <Title level="2" style={{ color: '#ffffff' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Title>
          <IconButton onClick={() => navigateMonth('next')}>
            <Icon24ChevronRight />
          </IconButton>
        </div>

        {/* Day Names */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '4px',
          marginBottom: '8px'
        }}>
          {dayNames.map((day) => (
            <div key={day} style={{ 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#E8D28C',
              padding: '8px 4px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '4px',
          marginBottom: '16px'
        }}>
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} style={{ height: '40px' }} />;
            }

            const dateStr = formatDate(day);
            const isSelected = selectedDate === dateStr;
            const isToday = formatDate(new Date()) === dateStr;

            return (
              <Button
                key={dateStr}
                mode={isSelected ? 'primary' : 'tertiary'}
                size="s"
                onClick={() => handleDateSelect(dateStr)}
                style={{ 
                  height: '40px',
                  minWidth: '40px',
                  position: 'relative',
                  backgroundColor: isSelected ? '#978041' : (isToday ? '#B8985C' : undefined),
                  color: isSelected ? '#ffffff' : (isToday ? '#ffffff' : undefined),
                  border: isToday ? '2px solid #E8D28C' : undefined,
                  fontWeight: isToday ? 'bold' : undefined
                }}
              >
                {day.getDate()}
                {getDayMarkers(day)}
              </Button>
            );
          })}
        </div>
        
        {/* Разделительная линия */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.3)',
          marginBottom: '16px'
        }} />
        
        {/* Легенда для маркеров */}
        <div>
          <Text style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Обозначения:
          </Text>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#9c27b0'
              }} />
              <Text style={{ fontSize: '11px', color: '#E8D28C' }}>Расклад Таро</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#ff9800'
              }} />
              <Text style={{ fontSize: '11px', color: '#E8D28C' }}>Аффирмация</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4caf50'
              }} />
              <Text style={{ fontSize: '11px', color: '#E8D28C' }}>Заметка</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#2196f3'
              }} />
              <Text style={{ fontSize: '11px', color: '#E8D28C' }}>Другая активность</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Правая часть - Активности и заметки (50%) */}
      <div style={{
        flex: '1',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid rgba(227,199,122,1)'
      }}>
        {selectedDate ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '100%'
          }}>
            {/* Заголовок выбранной даты */}
            <div>
              <Text style={{ 
                fontSize: '14px', 
                fontWeight: '300',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {(() => {
                  const [year, month, day] = selectedDate.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </Text>
              {/* Тонкая белая линия */}
              <div style={{
                width: '100%',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)',
                marginTop: '8px',
                marginBottom: '16px'
              }} />
            </div>

            {/* Activities Section */}
            {hasActivities && (
              <>
                <Text style={{ 
                  fontSize: '14px', 
                  fontWeight: '300',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Активности дня
                </Text>
                {/* Разделитель */}
                <div style={{
                  width: '100%',
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  marginBottom: '12px'
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {selectedDateData!.activities.map((activity) => (
                    <div key={activity.id} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}>
                          {getActivityIcon(activity.type, 'small')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ 
                            fontSize: '12px', 
                            color: '#ffffff', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>
                            {activity.title}
                          </Text>
                          <Text style={{ 
                            fontSize: '11px', 
                            color: '#E8D28C',
                            marginBottom: '4px'
                          }}>
                            {formatActivityTime(activity.timestamp)}
                          </Text>
                          <Text style={{ 
                            fontSize: '12px', 
                            color: 'rgba(232, 210, 140, 0.8)',
                            lineHeight: '1.3',
                            wordBreak: 'break-word'
                          }}>
                            {getActivityDetails(activity)}
                          </Text>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0, marginLeft: '8px' }}>
                        <IconButton
                          aria-label="Посмотреть детали"
                          onClick={() => handleViewActivity(activity)}
                          style={{ padding: '4px' }}
                        >
                          <Icon24View style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                        <IconButton
                          aria-label="Удалить активность"
                          onClick={() => handleDeleteActivity(activity, selectedDate!)}
                          style={{ padding: '4px' }}
                        >
                          <Icon24Delete style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Notes Section */}
            <div style={{ flex: 1 }}>
              {isEditingNote ? (
                <>
                  <Text style={{ 
                    fontSize: '14px', 
                    fontWeight: '300',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    Редактирование заметки
                  </Text>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    marginBottom: '12px'
                  }} />
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Введите заметку для этого дня..."
                    rows={4}
                    style={{ marginBottom: '8px', fontSize: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      mode="tertiary"
                      size="s"
                      onClick={handleCancelEdit}
                      style={{ fontSize: '10px' }}
                    >
                      Отмена
                    </Button>
                    <Button
                      mode="primary"
                      size="s"
                      onClick={handleSaveNote}
                      style={{ 
                        fontSize: '10px',
                        color: '#000000',
                        backgroundColor: '#978041',
                        border: '1px solid #E8D28C',
                        transition: 'all 0.2s ease'
                      }}
                      className="calendar-save-button"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#B8985C';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(232, 210, 140, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#978041';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ color: '#000000 !important' }}>Сохранить</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {hasNote ? (
                    <>
                      <Text style={{ 
                        fontSize: '14px', 
                        fontWeight: '300',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Заметка
                      </Text>
                      <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        marginTop: '8px',
                        marginBottom: '12px'
                      }} />
                      <Text style={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.4',
                        fontSize: '14px',
                        color: '#E8D28C',
                        marginBottom: '8px'
                      }}>
                        {selectedDateData!.note!.content}
                      </Text>
                      <Text style={{ 
                        fontSize: '12px', 
                        color: 'rgba(232, 210, 140, 0.6)',
                        marginBottom: '12px'
                      }}>
                        {new Date(selectedDateData!.note!.timestamp).toLocaleString('ru-RU')}
                      </Text>
                      <CustomButton
                        variant="tertiary"
                        size="s"
                        onClick={() => setIsEditingNote(true)}
                        style={{ fontSize: '11px' }}
                      >
                        Редактировать заметку
                      </CustomButton>
                    </>
                  ) : (
                    <>
                      <Text style={{ 
                        fontSize: '14px', 
                        fontWeight: '300',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Заметок пока нет
                      </Text>
                      <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        marginTop: '8px',
                        marginBottom: '12px'
                      }} />
                      <Text style={{ 
                        color: 'rgba(232, 210, 140, 0.8)', 
                        fontSize: '11px',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        Нажмите "Добавить" чтобы создать заметку для этого дня.
                      </Text>
                      <CustomButton
                        variant="tertiary"
                        size="s"
                        onClick={() => setIsEditingNote(true)}
                        style={{ fontSize: '11px' }}
                      >
                        Добавить заметку
                      </CustomButton>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <Icon28CalendarOutline style={{ 
              color: 'rgba(232, 210, 140, 0.6)', 
              marginBottom: '12px' 
            }} />
            <Text style={{ 
              fontSize: '14px', 
              fontWeight: '300',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Выберите дату
            </Text>
            <Text style={{ 
              color: 'rgba(232, 210, 140, 0.6)',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              Выберите дату в календаре для просмотра активностей и заметок
            </Text>
          </div>
        )}
      </div>
    </div>

    {/* Модальные окна */}
    <ModalRoot activeModal={activeModal} onClose={closeModal}>
        {/* Детали активности */}
        <ModalPage
          id="activity-details"
          header={
            <ModalPageHeader
              before={
                <PanelHeaderButton onClick={closeModal}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              }
            >
              Детали активности
            </ModalPageHeader>
          }
        >
          {selectedActivity && (
            <Group>
              <Card mode="shadow" style={{ margin: '16px' }}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                      {getActivityIcon(selectedActivity.type)}
                    </div>
                    <Badge mode="prominent">
                      {getActivityTypeLabel(selectedActivity.type)}
                    </Badge>
                  </div>
                  
                  <Title level="2" style={{ marginBottom: '8px' }}>
                    {selectedActivity.title}
                  </Title>
                  
                  {/* Отображаем полный контент через специальный компонент */}
                  <ActivityContentDisplay activity={selectedActivity} />
                  
                  <Text style={{ 
                    fontSize: '12px', 
                    color: 'var(--vkui--color_text_tertiary)' 
                  }}>
                    Время: {new Date(selectedActivity.timestamp).toLocaleString('ru-RU')}
                  </Text>
                </Div>
              </Card>
            </Group>
          )}
        </ModalPage>
        
        {/* Подтверждение удаления */}
        <ModalPage
          id="delete-confirm"
          header={
            <ModalPageHeader
              before={
                <PanelHeaderButton onClick={closeModal}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              }
            >
              Удаление активности
            </ModalPageHeader>
          }
        >
          {activityToDelete && (
            <Group>
              <Card mode="shadow" style={{ margin: '16px' }}>
                <Div style={{ padding: '16px' }}>
                  <Title level="3" style={{ marginBottom: '8px' }}>
                    Вы действительно хотите удалить эту активность?
                  </Title>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                      {getActivityIcon(activityToDelete.activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text weight="3" style={{ marginBottom: '4px' }}>
                        {activityToDelete.activity.title}
                      </Text>
                      <Text style={{ 
                        fontSize: '12px', 
                        color: 'var(--vkui--color_text_secondary)',
                        marginBottom: '4px'
                      }}>
                        {formatActivityTime(activityToDelete.activity.timestamp)}
                      </Text>
                    </div>
                  </div>
                  
                  <Text style={{ 
                    fontSize: '15px', 
                    color: 'var(--vkui--color_text_secondary)',
                    marginBottom: '16px',
                    lineHeight: '1.4'
                  }}>
                    {getActivityDetails(activityToDelete.activity)}
                  </Text>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      mode="outline" 
                      size="m"
                      onClick={confirmDeleteActivity}
                      stretched
                      style={{ color: 'var(--vkui--color_text_negative)' }}
                    >
                      Удалить
                    </Button>
                    <Button 
                      mode="secondary" 
                      size="m"
                      onClick={closeModal}
                      stretched
                    >
                      Отмена
                    </Button>
                  </div>
                </Div>
              </Card>
            </Group>
          )}
        </ModalPage>
      </ModalRoot>
    </>
  );
}; 