import React from 'react';
import { Button, Text, Title } from '@vkontakte/vkui';
import { Icon24Dismiss } from '@vkontakte/icons';
import { useAppSelector, useAppDispatch } from '../store';
import { hidePurchasePopup } from '../store/slices/starsSlice';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { BACKGROUND_BASE } from '../constants/styles';
import { StarButton } from './StarButton';

interface PurchaseStarsPopupProps {
  activeModal: string | null;
  onClose: () => void;
}

export const PurchaseStarsPopup: React.FC<PurchaseStarsPopupProps> = ({ 
  activeModal, 
  onClose 
}) => {
  const dispatch = useAppDispatch();
  const routeNavigator = useRouteNavigator();
  const { showPurchasePopup } = useAppSelector(state => state.stars);

  const handleClose = () => {
    dispatch(hidePurchasePopup());
    onClose();
  };

  const handlePurchase = () => {
    dispatch(hidePurchasePopup());
    onClose();
    routeNavigator.push('/stars-purchase');
  };

  const isOpen = activeModal === 'purchase-stars' || showPurchasePopup;

  if (!isOpen) return null;

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
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: isOpen ? 'auto' : 'none',
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
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
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
          Недостаточно звёзд
        </Title>

        {/* Разделитель */}
        <div style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
            marginBottom: '16px'
        }} />

        {/* Компонент звёзд */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          marginTop: '12px'
        }}>
          <div style={{ 
            pointerEvents: 'none',
            transform: 'scale(1.2)'
          }}>
            <StarButton size="m" />
          </div>
        </div>

        {/* Описание */}
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          textAlign: 'center',
          display: 'block',
          marginBottom: '16px',
          lineHeight: '20px'
        }}>
          Для создания гаданий и афирмаций нужны звёзды. 
          Пополните баланс, чтобы продолжить пользоваться приложением.
        </Text>

        {/* Разделитель */}
        <div style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
            marginBottom: '16px',
            marginTop: '16px'
        }} />

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexDirection: 'column'
        }}>
          <Button 
            size="l" 
            onClick={handlePurchase}
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
            Добавить звёзды
          </Button>
          
          <Button 
            mode="tertiary" 
            size="l" 
            onClick={handleClose}
            style={{
              fontSize: '16px'
            }}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};
