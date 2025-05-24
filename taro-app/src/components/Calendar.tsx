import React, { useState, useEffect } from 'react';
import {
  Div,
  Text,
  Title,
  Card,
  Button,
  Textarea,
  Spacing,
  Group,
  Header,
  Badge,
  SimpleCell,
  IconButton,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  ModalRoot
} from '@vkontakte/vkui';
import { Icon24ChevronLeft, Icon24ChevronRight, Icon28CalendarOutline, Icon24View, Icon24Delete, Icon24Dismiss } from '@vkontakte/icons';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setSelectedDate,
  loadCalendarData,
  updateCalendarNote,
  deleteCalendarNote,
  removeCalendarActivity,
  CalendarActivity
} from '../store/slices/calendarSlice';
import { ActivityContentDisplay } from './ActivityContentDisplay';

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

  const getActivityIcon = (type: CalendarActivity['type']) => {
    switch (type) {
      case 'tarot_reading':
        return '🔮';
      case 'affirmation':
        return '✨';
      default:
        return '📝';
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
            borderRadius: '50%',
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
            borderRadius: '50%',
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
            borderRadius: '50%',
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
            borderRadius: '50%',
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
      <Div style={{ padding: '0 16px' }}>
        <Group header={<Header size="l">Календарь активностей</Header>}>
          <Card mode="shadow">
            <Div style={{ padding: '16px' }}>
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
                <Title level="2">
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
                    color: 'var(--vkui--color_text_secondary)',
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
                gap: '4px'
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
                        backgroundColor: isToday ? 'var(--vkui--color_background_accent)' : undefined,
                        borderRadius: '8px'
                      }}
                    >
                      {day.getDate()}
                      {getDayMarkers(day)}
                    </Button>
                  );
                })}
              </div>
            </Div>
          </Card>
          
          {/* Легенда для маркеров */}
          <Card mode="outline" style={{ marginTop: '8px' }}>
            <Div style={{ padding: '12px' }}>
              <Text style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
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
                    backgroundColor: '#9c27b0',
                    borderRadius: '50%'
                  }} />
                  <Text style={{ fontSize: '11px' }}>Расклад Таро</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ff9800',
                    borderRadius: '50%'
                  }} />
                  <Text style={{ fontSize: '11px' }}>Аффирмация</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4caf50',
                    borderRadius: '50%'
                  }} />
                  <Text style={{ fontSize: '11px' }}>Заметка</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#2196f3',
                    borderRadius: '50%'
                  }} />
                  <Text style={{ fontSize: '11px' }}>Другая активность</Text>
                </div>
              </div>
            </Div>
          </Card>
        </Group>
      </Div>

      {selectedDate && (
        <Group header={<Header size="s">{(() => {
          const [year, month, day] = selectedDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        })()}</Header>}>
          
          {/* Activities Section */}
          {hasActivities && (
            <Card mode="shadow" style={{ marginBottom: '12px' }}>
              <Group header={<Header size="s">Активности дня</Header>}>
                <div style={{ padding: '0 16px' }}>
                  {selectedDateData!.activities.map((activity) => (
                    <SimpleCell
                      key={activity.id}
                      before={
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {getActivityIcon(activity.type)}
                          </span>
                          <Badge mode="prominent">
                            {getActivityTypeLabel(activity.type)}
                          </Badge>
                        </div>
                      }
                      after={
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <IconButton
                            aria-label="Посмотреть детали"
                            onClick={() => handleViewActivity(activity)}
                          >
                            <Icon24View />
                          </IconButton>
                          <IconButton
                            aria-label="Удалить активность"
                            onClick={() => handleDeleteActivity(activity, selectedDate!)}
                          >
                            <Icon24Delete />
                          </IconButton>
                        </div>
                      }
                      subtitle={
                        <>
                          <Text style={{ fontSize: '12px', color: 'var(--vkui--color_text_secondary)' }}>
                            {activity.summary}
                          </Text>
                          <Text style={{ fontSize: '11px', color: 'var(--vkui--color_text_tertiary)' }}>
                            {new Date(activity.timestamp).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </>
                      }
                    >
                      {activity.title}
                    </SimpleCell>
                  ))}
                </div>
              </Group>
            </Card>
          )}

          {/* Notes Section */}
          <Card mode="shadow">
            <Group header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Header size="s">Заметки</Header>
                {!isEditingNote && (
                  <Button
                    mode="tertiary"
                    size="s"
                    onClick={() => setIsEditingNote(true)}
                  >
                    {hasNote ? 'Редактировать' : 'Добавить'}
                  </Button>
                )}
              </div>
            }>
              <Div style={{ padding: '16px' }}>
                {isEditingNote ? (
                  <>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Введите заметку для этого дня..."
                      rows={4}
                      style={{ marginBottom: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button
                        mode="tertiary"
                        size="s"
                        onClick={handleCancelEdit}
                      >
                        Отмена
                      </Button>
                      <Button
                        mode="primary"
                        size="s"
                        onClick={handleSaveNote}
                      >
                        Сохранить
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {hasNote ? (
                      <div>
                        <Text style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                          {selectedDateData!.note!.content}
                        </Text>
                        <Spacing size={8} />
                        <Text style={{ 
                          fontSize: '12px', 
                          color: 'var(--vkui--color_text_tertiary)' 
                        }}>
                          Последнее изменение: {new Date(selectedDateData!.note!.timestamp).toLocaleString('ru-RU')}
                        </Text>
                      </div>
                    ) : (
                      <Text style={{ 
                        color: 'var(--vkui--color_text_secondary)', 
                        fontStyle: 'italic' 
                      }}>
                        Заметок пока нет. Нажмите "Добавить" чтобы создать заметку для этого дня.
                      </Text>
                    )}
                  </>
                )}
              </Div>
            </Group>
          </Card>
        </Group>
      )}

      {!selectedDate && (
        <Card mode="shadow">
          <Div style={{ padding: '32px', textAlign: 'center' }}>
            <Icon28CalendarOutline style={{ 
              color: 'var(--vkui--color_text_secondary)', 
              marginBottom: '16px' 
            }} />
            <Title level="3" style={{ marginBottom: '8px' }}>
              Выберите дату
            </Title>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              Выберите дату в календаре, чтобы просмотреть активности и заметки
            </Text>
          </Div>
        </Card>
      )}
      
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
                    <span style={{ fontSize: '24px' }}>
                      {getActivityIcon(selectedActivity.type)}
                    </span>
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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {getActivityIcon(activityToDelete.activity.type)}
                    </span>
                    <Text weight="3">{activityToDelete.activity.title}</Text>
                  </div>
                  
                  <Text style={{ 
                    fontSize: '14px', 
                    color: 'var(--vkui--color_text_secondary)',
                    marginBottom: '16px'
                  }}>
                    {activityToDelete.activity.summary}
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