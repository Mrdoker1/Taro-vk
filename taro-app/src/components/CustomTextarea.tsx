import { FC } from 'react';

interface CustomTextareaProps {
  value: string;
  placeholder?: string;
  label?: string;
  rows?: number;
  maxLength?: number;
  onChange: (value: string) => void;
}

export const CustomTextarea: FC<CustomTextareaProps> = ({
  value,
  placeholder = 'Введи свой вопрос...',
  label,
  rows = 4,
  maxLength = 150,
  onChange
}) => {
  const handleChange = (newValue: string) => {
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };
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
        maxLength={maxLength}
        onChange={(e) => handleChange(e.target.value)}
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
          resize: 'none',
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
      
      {/* Счетчик символов */}
      <div style={{
        textAlign: 'right',
        fontSize: '12px',
        color: value.length > maxLength * 0.9 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)',
        marginTop: '4px',
        paddingRight: '2px', // Небольшой отступ от края, чтобы не накладывался на resize handle
        fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {value.length}/{maxLength}
      </div>
      
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
          
          /* Стили для resize handle (квадратик для растягивания) */

          
          textarea::-webkit-resizer:hover {
            background: rgba(227, 199, 122, 0.8);
          }
          
          /* Для Firefox */
          textarea {
            scrollbar-color: rgba(227, 199, 122, 0.5) rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
    </div>
  );
};
