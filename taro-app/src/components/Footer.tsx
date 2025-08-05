import { FC, useState, useEffect } from 'react';
import { Div, Button } from '@vkontakte/vkui';
import logoSvg from '../assets/logo.svg';

interface FooterProps {
  onAboutApp?: () => void;
  onLegalInfo?: () => void;
}

export const Footer: FC<FooterProps> = ({ onAboutApp, onLegalInfo }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Отслеживание размера окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <Div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'space-between',
        padding: isMobile ? '12px 16px' : '12px 16px',
        height: isMobile ? 'auto' : '44px',
        gap: isMobile ? '12px' : '0',
        marginBottom: isMobile ? '20px' : '0' // Дополнительный отступ снизу для мобильного меню
      }}
    >
      {/* Кнопки - в мобильной версии сверху */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? '16px' : '24px',
        order: isMobile ? 1 : 2,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Button
          mode="tertiary"
          size="s"
          onClick={onAboutApp}
          style={{ color: '#ffffff' }}
        >
          О приложении
        </Button>
        <Button
          mode="tertiary"
          size="s"
          onClick={onLegalInfo}
          style={{ color: '#ffffff' }}
        >
          Правовая информация
        </Button>
      </div>
      
      {/* Логотип - в мобильной версии снизу */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        order: isMobile ? 2 : 1
      }}>
        <img 
          src={logoSvg} 
          alt="Seluna - расклады и советы Таро" 
          style={{ 
            width: isMobile ? '100px' : '115px', 
            height: 'auto' 
          }} 
        />
      </div>
    </Div>
  );
}; 