import { FC } from 'react';
import { Div, Button } from '@vkontakte/vkui';

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
        padding: '16px',
        borderTop: '1px solid var(--vkui--color_separator_primary)',
        marginTop: 'auto',
        backgroundColor: 'var(--vkui--color_background_content)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Временный SVG логотип */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="var(--vkui--color_accent_blue)"/>
          <path 
            d="M8 12L16 8L24 12L16 16L8 12Z" 
            fill="white"
          />
          <path 
            d="M8 16L16 12L24 16L16 20L8 16Z" 
            fill="white" 
            opacity="0.7"
          />
          <path 
            d="M8 20L16 16L24 20L16 24L8 20Z" 
            fill="white" 
            opacity="0.5"
          />
        </svg>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          color: 'var(--vkui--color_text_primary)'
        }}>
          Taro VK
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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