import React from 'react';
import { Popover, IconButton, Div } from '@vkontakte/vkui';
import questionMarkIcon from '../assets/question-mark.svg';

interface CustomTooltipProps {
  content: string;
  ariaLabel?: string;
  iconButtonStyle?: React.CSSProperties;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  content,
  ariaLabel = "Показать справку",
  iconButtonStyle = {}
}) => {
  return (
    <Popover
      content={
        <Div style={{ 
          maxWidth: '250px', 
          padding: '8px',
          backgroundColor: 'var(--app-background-color)',
          borderRadius: '8px',
          border: '1px solid rgba(227, 199, 122, 0.3)'
        }}>
          <div style={{ 
            fontSize: '14px',
            color: '#ffffff',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {content}
          </div>
        </Div>
      }
      style={{
        '--vkui--color_background_content': 'var(--app-background-color)',
        '--vkui--color_text_primary': '#ffffff'
      } as React.CSSProperties}
    >
      <IconButton
        hasActive={false}
        aria-label={ariaLabel}
        style={{
          backgroundColor: 'transparent',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          minWidth: '32px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          ...iconButtonStyle
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(227, 199, 122, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <img 
          src={questionMarkIcon} 
          alt="Question mark" 
          style={{
            width: '20px',
            height: '20px'
          }}
        />
      </IconButton>
    </Popover>
  );
}; 