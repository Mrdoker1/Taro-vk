import React, { useEffect } from 'react';
import { Button, Text, IconButton, Title } from '@vkontakte/vkui';
import { Icon24Dismiss } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { CalendarActivity } from '../store/slices/calendarSlice';
import calendarSpreadIcon from '../assets/calendar-spread.svg';
import calendarAffirmIcon from '../assets/calendar-affirm.svg';
import { BACKGROUND_BASE } from '../constants/styles';

interface DeleteActivityPopupProps {
  activity: CalendarActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getActivityDetails: (activity: CalendarActivity) => string;
}

export const DeleteActivityPopup: React.FC<DeleteActivityPopupProps> = ({
  activity,
  isOpen,
  onClose,
  onConfirm,
  getActivityDetails
}) => {
  // Обработчик системной кнопки "Назад"
  useEffect(() => {
    if (!isOpen) return;

    // Создаем обработчик истории для перехвата кнопки "Назад"
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      // Восстанавливаем состояние истории
      window.history.pushState(null, '', window.location.href);
    };

    // Добавляем состояние в историю
    window.history.pushState(null, '', window.location.href);
    
    // Подписываемся на событие popstate
    window.addEventListener('popstate', handlePopState);

    // Отписываемся при размонтировании или закрытии модалки
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !activity) return null;

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'tarot_reading':
        return (
          <img 
            src={calendarSpreadIcon} 
            alt="Расклад Таро" 
            style={{ width: '40px', height: '40px' }}
          />
        );
      case 'affirmation':
        return (
          <img 
            src={calendarAffirmIcon} 
            alt="Аффирмация" 
            style={{ width: '40px', height: '40px' }}
          />
        );
      default:
        return (
          <div style={{ 
            fontSize: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '40px', 
            height: '40px' 
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

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          ...BACKGROUND_BASE,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level="2" style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'Jost',
            margin: 0
          }}>
            Удаление активности
          </Title>
          
          {/* Close button */}
          <IconButton onClick={onClose}>
            <Icon24Dismiss />
          </IconButton>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Warning message */}
          <Text style={{
            fontSize: '16px',
            lineHeight: '1.4',
            color: '#ffffff',
            fontWeight: '400',
            textAlign: 'center'
          }}>
            Вы действительно хотите удалить эту активность?
          </Text>

          {/* Activity info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {getActivityIcon()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {activity.title}
              </Text>
              <Text style={{
                fontSize: '12px',
                color: '#E8D28C',
                marginBottom: '6px'
              }}>
                {formatActivityTime(activity.timestamp)}
              </Text>
              <Text style={{
                fontSize: '13px',
                lineHeight: '1.3',
                color: 'rgba(232, 210, 140, 0.8)',
                wordBreak: 'break-word'
              }}>
                {getActivityDetails(activity)}
              </Text>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px'
          }}>
            <Button
              mode="tertiary"
              size="m"
              onClick={onClose}
              stretched
              style={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              Отмена
            </Button>
            <Button
              mode="primary"
              size="m"
              onClick={onConfirm}
              stretched
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
                e.currentTarget.style.borderColor = '#bd2130';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.borderColor = '#dc3545';
              }}
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
