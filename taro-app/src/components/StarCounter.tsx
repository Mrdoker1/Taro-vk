import React from 'react';
import { Div, Button, Spacing, Text, Title } from '@vkontakte/vkui';
import { Icon28StarsOutline } from '@vkontakte/icons';
import { useAppSelector } from '../store';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

interface StarCounterProps {
  showInHeader?: boolean;
  showTitle?: boolean;
  className?: string;
}

export const StarCounter: React.FC<StarCounterProps> = ({ 
  showInHeader = false, 
  showTitle = true,
  className = ''
}) => {
  const { count, loading, error } = useAppSelector(state => state.stars);
  const routeNavigator = useRouteNavigator();

  const handlePurchaseClick = () => {
    routeNavigator.push('/stars-purchase');
  };

  if (showInHeader) {
    return (
      <Div className={`star-counter-header ${className}`} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 12px',
        background: 'var(--vkui--color_background_secondary)',
        borderRadius: '12px',
        margin: '0 16px'
      }}>
        <Icon28StarsOutline width={20} height={20} fill="var(--vkui--color_icon_accent)" />
        <Text weight="3" style={{ color: 'var(--vkui--color_text_primary)' }}>
          {loading ? '...' : count}
        </Text>
        {count === 0 && (
          <Button 
            size="s" 
            mode="secondary" 
            onClick={handlePurchaseClick}
          >
            Купить
          </Button>
        )}
      </Div>
    );
  }

  return (
    <Div className={`star-counter ${className}`}>
      {showTitle && (
        <>
          <Title level="2" weight="3">
            Твои звёзды
          </Title>
          <Spacing size={12} />
        </>
      )}
      
      <Div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px',
        background: 'var(--vkui--color_background_secondary)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon28StarsOutline fill="var(--vkui--color_icon_accent)" />
          <div>
            <Text weight="3" style={{ fontSize: '18px' }}>
              {loading ? 'Загрузка...' : `${count} звёзд`}
            </Text>
            <Text style={{ 
              color: 'var(--vkui--color_text_secondary)',
              fontSize: '14px' 
            }}>
              Используются для гаданий и афирмаций
            </Text>
          </div>
        </div>
        
        {count <= 3 && (
          <Button 
            mode="primary" 
            size="m"
            onClick={handlePurchaseClick}
          >
            {count === 0 ? 'Добавить звёзды' : 'Пополнить'}
          </Button>
        )}
      </Div>

      {error && (
        <>
          <Spacing size={12} />
                    <Text style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '14px' }}>
            Ошибка: {error[0].toLowerCase() + error.slice(1)}
          </Text>
        </>
      )}
    </Div>
  );
};
