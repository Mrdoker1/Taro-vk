import React, { useEffect } from 'react';
import { Button, Text, Title } from '@vkontakte/vkui';
import { Icon24Dismiss } from '@vkontakte/icons';
import { useAppSelector, useAppDispatch } from '../store';
import { hideNotification, clearNotification } from '../store/slices/pinsSlice';
import { useScrollLock } from '../hooks/useScrollLock';
import pinAffirmation from '../assets/pin-affirmation.png';
import pinCalendar from '../assets/pin-calendar.png';
import pinSpreads from '../assets/pin-spreads.png';
import pinStar from '../assets/pin-star.png';
import { BACKGROUND_BASE } from '../constants/styles';

const pinImages: Record<string, string> = {
  affirmation: pinAffirmation,
  calendar: pinCalendar,
  spreads: pinSpreads,
  star: pinStar,
};

export const PinNotificationPopup: React.FC = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector(state => state.pins.notification);

  // Блокируем скролл фона когда попап открыт
  useScrollLock(!!notification?.isVisible);

  // Полная очистка после анимации скрытия
  useEffect(() => {
    if (notification && !notification.isVisible) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 300); // время анимации

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  const { pin, isVisible } = notification;

  const handleClose = () => {
    dispatch(hideNotification());
  };

  const handleGoToCollection = () => {
    // Просто закрываем уведомление без навигации, чтобы не потерять состояние текущей страницы
    dispatch(hideNotification());
    // Пользователь может самостоятельно перейти к коллекции через профиль или настройки
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: isVisible ? 'auto' : 'none',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...BACKGROUND_BASE,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '340px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
          }}
        >
          <Icon24Dismiss />
        </button>

        {/* Заголовок */}
        <Title level="2" style={{
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '500',
          margin: '0 0 8px 0',
          paddingRight: '40px'
        }}>
          Новое достижение!
        </Title>

        {/* Разделитель */}
        <div style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)'
        }} />

        {/* Изображение пина */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <img 
            src={pinImages[pin.id] || pin.image} 
            alt={pin.name}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Название пина */}
        <Title level="3" style={{
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          {pin.name}
        </Title>

        {/* Описание */}
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          textAlign: 'center',
          display: 'block',
          marginBottom: '16px',
          lineHeight: '20px'
        }}>
          {pin.description}
        </Text>

        {/* Разделитель */}
        <div style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
            marginBottom: '16px',
            marginTop: '16px'
        }} />

        {/* Требование */}
        <Text style={{
          color: '#4BB34B',
          fontSize: '14px',
          textAlign: 'center',
          display: 'block',
          marginBottom: '8px'
        }}>
          ✓ {pin.requirement}
        </Text>

        {/* Подсказка о коллекции */}
        <Text style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
          textAlign: 'center',
          display: 'block',
          marginBottom: '20px',
          fontStyle: 'italic'
        }}>
          Твои достижения доступны в профиле
        </Text>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexDirection: 'column'
        }}>
          <Button 
            size="l" 
            onClick={handleGoToCollection}
            style={{
              fontSize: '16px',
              color: '#000000',
              backgroundColor: '#978041',
              border: '1px solid #E8D28C',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
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
            Отлично!
          </Button>
        </div>
      </div>
    </div>
  );
};
