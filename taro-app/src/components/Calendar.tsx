import React, { useState, useEffect } from 'react';
import {
  Div,
  Text,
  Title,
  Button,
  Textarea,
  IconButton
} from '@vkontakte/vkui';
import { Icon24ChevronLeft, Icon24ChevronRight, Icon28CalendarOutline, Icon24View, Icon24Delete } from '@vkontakte/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { useResponsive } from '../hooks/useResponsive';
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
import { ActivityDetailPopup } from './ActivityDetailPopup';
import { DeleteActivityPopup } from './DeleteActivityPopup';

interface CalendarProps {
  activeModal?: string;
  setActiveModal?: (modal: string | null) => void;
}

export const Calendar: React.FC<CalendarProps> = () => {
  const dispatch = useAppDispatch();
  const { daysData, selectedDate, loading, error } = useAppSelector((state) => state.calendar);
  const isMobile = useResponsive();
  const [noteText, setNoteText] = useState('');
  const [originalNoteText, setOriginalNoteText] = useState(''); // Для отслеживания изменений
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
      const noteContent = dayData?.note?.content || '';
      setNoteText(noteContent);
      setOriginalNoteText(noteContent); // Сохраняем оригинальный текст
    }
  }, [selectedDate, daysData]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (dateStr: string) => {
    // Запрещаем переключение дат во время редактирования заметки
    if (isEditingNote) {
      return;
    }
    dispatch(setSelectedDate(dateStr));
  };

  const handleSaveNote = async () => {
    if (!selectedDate) return;

    try {
      if (noteText.trim()) {
        await dispatch(updateCalendarNote(selectedDate, {
          id: `note_${selectedDate}_${Date.now()}`,
          content: noteText.trim(),
          timestamp: Date.now(),
        }));
      } else {
        await dispatch(deleteCalendarNote(selectedDate));
      }
      
      // Обновляем оригинальный текст после успешного сохранения
      setOriginalNoteText(noteText.trim());
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error);
    } finally {
      // Закрываем редактирование в любом случае
      setIsEditingNote(false);
    }
  };

  const handleCancelEdit = () => {
    const dayData = selectedDate ? daysData[selectedDate] : null;
    const noteContent = dayData?.note?.content || '';
    setNoteText(noteContent);
    setOriginalNoteText(noteContent); // Восстанавливаем оригинальный текст
    setIsEditingNote(false);
  };

  const handleStartEdit = () => {
    const dayData = selectedDate ? daysData[selectedDate] : null;
    const noteContent = dayData?.note?.content || '';
    setNoteText(noteContent);
    setOriginalNoteText(noteContent); // Устанавливаем оригинальный текст при начале редактирования
    setIsEditingNote(true);
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
    // Запрещаем навигацию по месяцам во время редактирования заметки
    if (isEditingNote) {
      return;
    }
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
  
  // Проверяем, были ли внесены изменения в заметку
  const hasNoteChanges = noteText.trim() !== originalNoteText.trim();

  const getDayMarkers = (date: Date): React.ReactNode => {
    const dateStr = formatDate(date);
    const dayData = daysData[dateStr];
    
    if (!dayData) return null;
    
    const hasNote = !!dayData.note;
    const hasTarotReading = dayData.activities.some(activity => activity.type === 'tarot_reading');
    const hasAffirmation = dayData.activities.some(activity => activity.type === 'affirmation');
    
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
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        width: '100%',
        minHeight: isMobile ? 'auto' : '400px'
      }}>
      {/* Левая часть (на десктопе) / Верхняя часть (на мобиле) - Календарь и обозначения */}
      <div style={{
        flex: isMobile ? 'none' : '1',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: isMobile ? '12px' : '16px',
        borderRadius: '8px',
        height: 'fit-content'
      }}>
        {/* Calendar Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: isMobile ? '12px' : '16px'
        }}>
          <IconButton 
            onClick={() => navigateMonth('prev')} 
            aria-label="Предыдущий месяц"
            disabled={isEditingNote}
            style={{ opacity: isEditingNote ? 0.5 : 1 }}
          >
            <Icon24ChevronLeft />
          </IconButton>
          <Title level="2" style={{ 
            color: '#ffffff',
            fontSize: isMobile ? '16px' : '18px',
            textAlign: 'center'
          }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Title>
          <IconButton 
            onClick={() => navigateMonth('next')} 
            aria-label="Следующий месяц"
            disabled={isEditingNote}
            style={{ opacity: isEditingNote ? 0.5 : 1 }}
          >
            <Icon24ChevronRight />
          </IconButton>
        </div>

        {/* Day Names */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: isMobile ? '2px' : '4px',
          marginBottom: isMobile ? '6px' : '8px'
        }}>
          {dayNames.map((day) => (
            <div key={day} style={{ 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: isMobile ? '10px' : '12px',
              color: '#E8D28C',
              padding: isMobile ? '4px 2px' : '8px 4px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: isMobile ? '2px' : '4px',
          marginBottom: isMobile ? '12px' : '16px'
        }}>
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} style={{ height: isMobile ? '32px' : '40px' }} />;
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
                disabled={isEditingNote} // Блокируем кнопки во время редактирования
                style={{ 
                  height: isMobile ? '32px' : '40px',
                  minWidth: isMobile ? '32px' : '40px',
                  position: 'relative',
                  backgroundColor: isSelected ? '#978041' : (isToday ? '#B8985C' : undefined),
                  color: isSelected ? '#ffffff' : (isToday ? '#ffffff' : undefined),
                  border: isToday ? '2px solid #E8D28C' : undefined,
                  fontWeight: isToday ? 'bold' : undefined,
                  fontSize: isToday ? (isMobile ? '9px' : '10px') : (isMobile ? '10px' : '12px'),
                  padding: '0', // Убираем весь padding
                  paddingLeft: '0',
                  paddingRight: '0',
                  opacity: isEditingNote ? 0.5 : 1, // Визуально показываем блокировку
                  cursor: isEditingNote ? 'not-allowed' : 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  textAlign: 'center',
                  lineHeight: 1
                }}>
                  {day.getDate()}
                </div>
                {getDayMarkers(day)}
              </Button>
            );
          })}
        </div>
        
        {/* Разделительная линия */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
          marginBottom: isMobile ? '12px' : '16px'
        }} />
        
        {/* Легенда для маркеров */}
        <div>
          <Text style={{ 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: 'bold', 
            marginBottom: isMobile ? '6px' : '8px',
            color: '#ffffff'
          }}>
            Обозначения:
          </Text>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? '8px' : '12px',
            fontSize: isMobile ? '10px' : '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: isMobile ? '10px' : '12px',
                height: isMobile ? '10px' : '12px',
                backgroundColor: '#9c27b0'
              }} />
              <Text style={{ fontSize: isMobile ? '10px' : '11px', color: '#E8D28C' }}>Расклад Таро</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: isMobile ? '10px' : '12px',
                height: isMobile ? '10px' : '12px',
                backgroundColor: '#ff9800'
              }} />
              <Text style={{ fontSize: isMobile ? '10px' : '11px', color: '#E8D28C' }}>Аффирмация</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: isMobile ? '10px' : '12px',
                height: isMobile ? '10px' : '12px',
                backgroundColor: '#4caf50'
              }} />
              <Text style={{ fontSize: isMobile ? '10px' : '11px', color: '#E8D28C' }}>Заметка</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Правая часть - Активности и заметки (50%) */}
      <div style={{
        flex: '1',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: isMobile ? '12px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: isMobile ? 'none' : '1px solid rgba(227,199,122,1)'
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
                fontSize: isMobile ? '12px' : '14px', 
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
                background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                marginTop: isMobile ? '6px' : '8px',
                marginBottom: isMobile ? '12px' : '16px'
              }} />
            </div>

            {/* Activities Section */}
            {hasActivities && (
              <>
                <Text style={{ 
                  fontSize: isMobile ? '12px' : '14px', 
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
                  background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                  marginBottom: isMobile ? '8px' : '12px'
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px', marginBottom: isMobile ? '12px' : '16px' }}>
                  {selectedDateData!.activities.map((activity) => (
                    <div key={activity.id} style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                      borderRadius: '4px',
                      padding: isMobile ? '12px' : '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '8px' : '12px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', flexShrink: 0 }}>
                          {getActivityIcon(activity.type, 'small')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ 
                            fontSize: isMobile ? '12px' : '13px', 
                            color: '#ffffff', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px',
                            fontFamily: 'Jost'
                          }}>
                            {activity.title}
                          </Text>
                          <Text style={{ 
                            fontSize: '11px', 
                            color: '#E8D28C',
                            marginBottom: '4px',
                            fontFamily: 'Jost'
                          }}>
                            {formatActivityTime(activity.timestamp)}
                          </Text>
                          <Text style={{ 
                            fontSize: '12px', 
                            color: 'rgba(232, 210, 140, 0.8)',
                            lineHeight: '1.3',
                            wordBreak: 'break-word',
                            fontFamily: 'Jost'
                          }}>
                            {getActivityDetails(activity)}
                          </Text>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: isMobile ? '1px' : '2px', flexShrink: 0, marginLeft: isMobile ? '4px' : '8px' }}>
                        <IconButton
                          aria-label="Посмотреть детали"
                          onClick={() => handleViewActivity(activity)}
                          style={{ padding: isMobile ? '2px' : '4px' }}
                        >
                          <Icon24View style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                        <IconButton
                          aria-label="Удалить активность"
                          onClick={() => handleDeleteActivity(activity, selectedDate!)}
                          style={{ padding: isMobile ? '2px' : '4px' }}
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
                    fontSize: isMobile ? '12px' : '14px', 
                    fontWeight: '300',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: isMobile ? '6px' : '8px'
                  }}>
                    Редактирование заметки
                  </Text>
                  <Text style={{ 
                    fontSize: isMobile ? '10px' : '11px', 
                    fontWeight: '300',
                    color: '#E8D28C',
                    marginBottom: isMobile ? '4px' : '6px',
                    opacity: 0.8
                  }}>
                    💡 Переключение дат заблокировано во время редактирования
                  </Text>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                    marginBottom: isMobile ? '8px' : '12px'
                  }} />
                  <Textarea
                    value={noteText}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue.length <= 300) {
                        setNoteText(newValue);
                      }
                    }}
                    placeholder="Введи заметку для этого дня..."
                    rows={isMobile ? 3 : 4}
                    maxLength={300}
                    style={{ marginBottom: isMobile ? '6px' : '8px', fontSize: isMobile ? '11px' : '12px' }}
                  />
                  {/* Счетчик символов для заметки */}
                  <div style={{
                    textAlign: 'right',
                    fontSize: '10px',
                    color: noteText.length > 270 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)',
                    marginBottom: isMobile ? '6px' : '8px',
                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}>
                    {noteText.length}/300
                  </div>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      mode="tertiary"
                      size="s"
                      onClick={handleCancelEdit}
                      style={{ fontSize: isMobile ? '9px' : '10px' }}
                    >
                      Отмена
                    </Button>
                    <Button
                      mode="primary"
                      size="s"
                      onClick={handleSaveNote}
                      disabled={!hasNoteChanges} // Блокируем если нет изменений
                      style={{ 
                        fontSize: isMobile ? '9px' : '10px',
                        color: hasNoteChanges ? '#000000' : '#666666',
                        backgroundColor: hasNoteChanges ? '#978041' : '#444444',
                        border: hasNoteChanges ? '1px solid #E8D28C' : '1px solid #666666',
                        transition: 'all 0.2s ease',
                        opacity: hasNoteChanges ? 1 : 0.6,
                        cursor: hasNoteChanges ? 'pointer' : 'not-allowed'
                      }}
                      className="calendar-save-button"
                      onMouseEnter={(e) => {
                        if (hasNoteChanges) {
                          e.currentTarget.style.backgroundColor = '#B8985C';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(232, 210, 140, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasNoteChanges) {
                          e.currentTarget.style.backgroundColor = '#978041';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <span style={{ color: hasNoteChanges ? '#000000 !important' : '#666666 !important' }}>
                        Сохранить
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {hasNote ? (
                    <>
                      <Text style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
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
                        background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                        marginTop: isMobile ? '6px' : '8px',
                        marginBottom: isMobile ? '8px' : '12px'
                      }} />
                      <Text style={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.4',
                        fontSize: isMobile ? '12px' : '14px',
                        color: '#E8D28C',
                        marginBottom: isMobile ? '6px' : '8px'
                      }}>
                        {selectedDateData!.note!.content}
                      </Text>
                      <Text style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: 'rgba(232, 210, 140, 0.6)',
                        marginBottom: isMobile ? '8px' : '12px'
                      }}>
                        {new Date(selectedDateData!.note!.timestamp).toLocaleString('ru-RU')}
                      </Text>
                      <Button
                        mode="tertiary"
                        size="s"
                        onClick={handleStartEdit}
                        style={{ 
                          fontSize: isMobile ? '10px' : '11px',
                          transition: 'all 0.2s ease',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1) !important';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Редактировать заметку
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
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
                        background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                        marginTop: isMobile ? '6px' : '8px',
                        marginBottom: isMobile ? '8px' : '12px'
                      }} />
                      <Text style={{ 
                        color: 'rgba(232, 210, 140, 0.8)', 
                        fontSize: isMobile ? '13px' : '14px',
                        marginBottom: isMobile ? '8px' : '12px',
                        lineHeight: '1.4'
                      }}>
                        Нажмите "Добавить заметку", чтобы создать заметку для этого дня.
                      </Text>
                      <Button
                        mode="tertiary"
                        size="s"
                        onClick={handleStartEdit}
                        style={{ 
                          fontSize: isMobile ? '10px' : '11px',
                          transition: 'all 0.2s ease',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1) !important';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Добавить заметку
                      </Button>
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
              marginBottom: isMobile ? '8px' : '12px',
              width: '28px',
              height: '28px'
            }} />
            <Text style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              fontWeight: '300',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: isMobile ? '6px' : '8px'
            }}>
              Выбери дату
            </Text>
            <Text style={{ 
              color: 'rgba(232, 210, 140, 0.6)',
              fontSize: isMobile ? '10px' : '11px',
              lineHeight: '1.4'
            }}>
              Кликните на дату в календаре, чтобы посмотреть активности и заметки
            </Text>
          </div>
        )}
      </div>
    </div>

    {/* Кастомный попап для деталей активности */}
    <ActivityDetailPopup 
      activity={selectedActivity!}
      isOpen={activeModal === 'activity-details' && selectedActivity !== null}
      onClose={closeModal}
    />

    {/* Кастомный попап для удаления активности */}
    <DeleteActivityPopup
      activity={activityToDelete?.activity || null}
      isOpen={activeModal === 'delete-confirm' && activityToDelete !== null}
      onClose={closeModal}
      onConfirm={confirmDeleteActivity}
      getActivityDetails={getActivityDetails}
    />

    </>
  );
}; 