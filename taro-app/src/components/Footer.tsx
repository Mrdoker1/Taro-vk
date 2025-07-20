import { FC } from 'react';
import { Div, Button } from '@vkontakte/vkui';
import logoSvg from '../assets/logo.svg';

interface FooterProps {
  onAboutApp?: () => void;
  onLegalInfo?: () => void;
}

export const Footer: FC<FooterProps> = ({ onAboutApp, onLegalInfo }) => {
  return (
    <Div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        height: '44px'
      }}
    >
      {/* Логотип слева */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={logoSvg} 
          alt="Taro VK Logo" 
          style={{ 
            width: '115px', 
            height: 'auto' 
          }} 
        />
      </div>
      
      {/* Кнопки справа */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Button
          mode="tertiary"
          size="s"
          onClick={onAboutApp}
        >
          О приложении
        </Button>
        <Button
          mode="tertiary"
          size="s"
          onClick={onLegalInfo}
        >
          Правовая информация
        </Button>
      </div>
    </Div>
  );
}; 