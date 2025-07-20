import { FC } from 'react';
import { Text } from '@vkontakte/vkui';

interface MagicLoaderProps {
  text?: string;
  size?: 's' | 'm' | 'l';
}

export const MagicLoader: FC<MagicLoaderProps> = ({ 
  text = 'Загружаем магию...', 
  size = 'm' 
}) => {
  const sizeConfig = {
    s: { 
      iconSize: '24px', 
      fontSize: '14px',
      containerSize: '32px'
    },
    m: { 
      iconSize: '32px', 
      fontSize: '16px',
      containerSize: '40px'
    },
    l: { 
      iconSize: '40px', 
      fontSize: '18px',
      containerSize: '48px'
    }
  };

  const currentSize = sizeConfig[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px 16px'
    }}>
      {/* Анимированная магическая иконка */}
      <div style={{
        position: 'relative',
        width: currentSize.containerSize,
        height: currentSize.containerSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Внешнее кольцо */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '2px solid transparent',
          borderTopColor: 'var(--vkui--color_accent)',
          borderRadius: '50%',
          animation: 'magicSpin 2s linear infinite'
        }} />
        
        {/* Внутреннее кольцо */}
        <div style={{
          position: 'absolute',
          width: '75%',
          height: '75%',
          border: '2px solid transparent',
          borderRightColor: 'var(--vkui--color_accent_orange)',
          borderRadius: '50%',
          animation: 'magicSpinReverse 1.5s linear infinite'
        }} />
        
        {/* Центральная звезда */}
        <div style={{
          fontSize: currentSize.iconSize,
          animation: 'magicPulse 1s ease-in-out infinite alternate'
        }}>
          ✨
        </div>
      </div>

      {/* Текст */}
      <Text style={{
        color: 'var(--vkui--color_text_secondary)',
        fontSize: currentSize.fontSize,
        textAlign: 'center',
        fontWeight: '500'
      }}>
        {text}
      </Text>

      {/* CSS анимации */}
      <style>{`
        @keyframes magicSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes magicSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes magicPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
