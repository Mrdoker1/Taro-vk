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
            maxWidth: '500px',
            width: '100%',
            justifyContent: 'space-between'
          }}>
            {center}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {right}
        </div>
      </Div>
      
      {/* Меню под аватаром (только в мобильной версии) */}
      {isMobile && center && (
        <Div style={{ 
          padding: '0 16px 12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            {center}
          </div>
        </Div>
      )}
    </div>
  );
}; 