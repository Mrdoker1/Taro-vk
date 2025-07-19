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
          backgroundColor: 'rgba(227, 199, 122, 0.95)',
          borderRadius: '8px'
        }}>
          <div style={{ 
            fontSize: '14px',
            color: '#1a1a1a',
            fontWeight: '500'
          }}>
            {content}
          </div>
        </Div>
      }
      style={{
        '--vkui--color_background_content': 'rgba(227, 199, 122, 0.95)',
        '--vkui--color_text_primary': '#1a1a1a'
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