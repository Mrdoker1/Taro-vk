import { FC } from 'react';

interface CustomTextareaProps {
  value: string;
  placeholder?: string;
  label?: string;
  rows?: number;
  onChange: (value: string) => void;
}

export const CustomTextarea: FC<CustomTextareaProps> = ({
  value,
  placeholder = 'Введи свой вопрос...',
  label,
  rows = 4,
  onChange
}) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '400',
          marginBottom: '8px',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          {label}
        </label>
      )}
      
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '12px',
          border: '2px solid rgba(227, 199, 122, 1)',
          borderRadius: '3px',
          backgroundColor: 'transparent',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '400',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(227, 199, 122, 1)';
          e.target.style.boxShadow = '0 0 0 1px rgba(227, 199, 122, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(227, 199, 122, 1)';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      <style>
        {`
          textarea::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          
          textarea::-webkit-scrollbar {
            width: 8px;
          }
          
          textarea::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          textarea::-webkit-scrollbar-thumb {
            background: rgba(227, 199, 122, 0.5);
            border-radius: 4px;
          }
          
          textarea::-webkit-scrollbar-thumb:hover {
            background: rgba(227, 199, 122, 0.7);
          }
        `}
      </style>
    </div>
  );
};
