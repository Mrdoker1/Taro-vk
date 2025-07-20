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
        {/* Фоновый круг с градиентом */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, var(--vkui--color_accent), var(--vkui--color_accent_orange), var(--vkui--color_accent), transparent)',
          animation: 'magicRotate 2s linear infinite',
          opacity: 0.6
        }} />
        
        {/* Внутренний круг */}
        <div style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: 'transparent',
          animation: 'magicPulse 1.5s ease-in-out infinite alternate'
        }} />
        
        {/* Орбитальные точки */}
        <div style={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--vkui--color_accent)',
          top: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'magicOrbit 3s linear infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'var(--vkui--color_accent_orange)',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'magicOrbitReverse 2.5s linear infinite'
        }} />
        
        {/* Центральная звезда */}
        <div style={{
          fontSize: currentSize.iconSize,
          animation: 'magicTwinkle 1s ease-in-out infinite alternate',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
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
        @keyframes magicRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes magicPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        
        @keyframes magicOrbit {
          0% { transform: translateX(-50%) rotate(0deg) translateY(-${parseInt(currentSize.containerSize) / 2 - 3}px) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg) translateY(-${parseInt(currentSize.containerSize) / 2 - 3}px) rotate(-360deg); }
        }
        
        @keyframes magicOrbitReverse {
          0% { transform: translateX(-50%) rotate(360deg) translateY(${parseInt(currentSize.containerSize) / 2 - 3}px) rotate(-360deg); }
          100% { transform: translateX(-50%) rotate(0deg) translateY(${parseInt(currentSize.containerSize) / 2 - 3}px) rotate(0deg); }
        }
        
        @keyframes magicTwinkle {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
