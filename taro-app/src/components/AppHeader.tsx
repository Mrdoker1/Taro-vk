import React from 'react';
import { Div } from '@vkontakte/vkui';

interface AppHeaderProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ left, center, right }) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <div style={{ position: 'relative' }}>
      {/* Верхний ряд: аватар и кнопка звезд */}
      <Div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          height: '44px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {left}
        </div>
        
        {/* Десктопное меню (в центре) */}
        {!isMobile && center && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {center}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {right}
        </div>
      </Div>
      
      {/* Мобильное меню больше не отображается здесь - оно теперь внизу */}
    </div>
  );
}; 