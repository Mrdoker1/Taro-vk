import React from 'react';
import { Button } from '@vkontakte/vkui';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 's' | 'm' | 'l';
  stretched?: boolean;
  style?: React.CSSProperties;
  mobileSize?: 'xs' | 's' | 'm'; // новый проп для мобильных размеров
  icon?: React.ReactNode; // Новый проп для иконки слева от текста
  iconSize?: number; // Размер иконки (по умолчанию будет зависеть от размера кнопки)
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'secondary',
  children,
  onClick,
  disabled = false,
  size = 'm',
  stretched = false,
  style = {},
  mobileSize,
  icon,
  iconSize
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Отслеживание размера окна
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  // Функция для мобильного размера шрифта
  const getMobileFontSize = () => {
    if (!isMobile) return '14px';
    if (mobileSize === 'xs') return '12px';
    if (mobileSize === 's') return '12px';
    if (mobileSize === 'm') return '12px';
    return size === 's' ? '12px' : '12px';
  };

  // Функция для определения размера иконки
  const getIconSize = () => {
    if (iconSize) return iconSize;
    if (isMobile) {
      if (mobileSize === 'xs') return 14;
      if (mobileSize === 's') return 16;
      if (mobileSize === 'm') return 18;
      return size === 's' ? 16 : 18;
    }
    return size === 's' ? 18 : size === 'm' ? 20 : 22;
  };

  const getButtonStyles = (): React.CSSProperties => {
    // Адаптивные размеры для мобильных
    const getMobileMinHeight = () => {
      if (!isMobile) return '44px';
      if (mobileSize === 'xs') return '28px';
      if (mobileSize === 's') return '32px';
      if (mobileSize === 'm') return '36px';
      return size === 's' ? '32px' : size === 'm' ? '36px' : '40px';
    };

    const getMobilePadding = () => {
      if (!isMobile) return undefined;
      if (mobileSize === 'xs') return '2px 6px';
      if (mobileSize === 's') return '4px 8px';
      if (mobileSize === 'm') return '6px 12px';
      return size === 's' ? '4px 8px' : undefined;
    };

    const baseStyles: React.CSSProperties = {
      minHeight: getMobileMinHeight(),
      // textTransform: 'uppercase',
      // letterSpacing: '1px',
      fontSize: getMobileFontSize(),
      fontWeight: '100',
      borderRadius: '3px',
      position: 'relative',
      overflow: 'hidden',
      transition: isTouch ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: getMobilePadding(),
      ...style
    };

    // Отключаем hover эффекты на мобильных/touch устройствах
    const shouldShowHoverEffects = !isTouch && isHovered;

    if (variant === 'primary') {
      return {
        ...baseStyles,
        border: isMobile ? '1px solid #978041' : '1px solid #978041',
        background: shouldShowHoverEffects 
          ? 'linear-gradient(90deg, #CFAE1D 0%, #714F0D 100%)'
          : 'linear-gradient(90deg, #CFAE1D 0%, #714F0D 100%)',
        color: 'white',
        boxShadow: shouldShowHoverEffects 
          ? '0 0 20px rgba(227, 199, 122, 0.6), 0 0 40px rgba(227, 199, 122, 0.4), 0 0 60px rgba(227, 199, 122, 0.2), inset 0 0 0 3px rgba(0, 0, 0, 0.3)'
          : isMobile 
            ? '0 0 5px rgba(227, 199, 122, 0.2), inset 0 0 0 2px rgba(0, 0, 0, 0.3)'
            : '0 0 10px rgba(227, 199, 122, 0.3), inset 0 0 0 3px rgba(0, 0, 0, 0.3)',
        transform: isActive ? 'scale(0.98)' : (shouldShowHoverEffects ? 'translateY(-2px) scale(1.02)' : 'none'),
      };
    }

    if (variant === 'tertiary') {
      return {
        ...baseStyles,
        border: 'none !important',
        backgroundColor: 'transparent !important',
        color: shouldShowHoverEffects ? '#E8D28C' : 'rgba(232, 210, 140, 0.8)',
        boxShadow: 'none !important',
        transform: isActive ? 'scale(0.97)' : (shouldShowHoverEffects ? 'scale(1.02)' : 'none'),
        textDecoration: 'none',
        padding: '0 !important',
        margin: '0 !important',
        minHeight: isMobile ? '28px' : '32px',
        width: 'auto !important',
        minWidth: 'auto !important',
        outline: 'none !important',
        borderRadius: '0 !important',
      };
    }

    // Secondary style с магическими эффектами
    return {
      ...baseStyles,
      border: isMobile ? '1px solid rgba(151, 128, 65, 1)' : '1px solid rgba(151, 128, 65, 1)',
      backgroundColor: shouldShowHoverEffects ? 'rgba(151, 128, 65, 0.15)' : 'transparent',
      color: 'white',
      boxShadow: shouldShowHoverEffects 
        ? '0 0 15px rgba(151, 128, 65, 0.5), 0 0 30px rgba(151, 128, 65, 0.3), inset 0 0 15px rgba(151, 128, 65, 0.1)'
        : isMobile 
          ? '0 0 3px rgba(151, 128, 65, 0.15)'
          : '0 0 5px rgba(151, 128, 65, 0.2)',
      transform: isActive ? 'scale(0.97)' : (shouldShowHoverEffects ? 'translateY(-1px) scale(1.01)' : 'none'),
    };
  };

  const getSparkleEffect = (): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: (isHovered && !isTouch && variant !== 'tertiary') 
      ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)'
      : 'none',
    animation: (isHovered && !isTouch && variant !== 'tertiary') ? 'magicSparkle 2s infinite' : 'none',
    pointerEvents: 'none',
    borderRadius: '3px',
    display: variant === 'tertiary' ? 'none' : 'block'
  });

  return (
    <>
      <style>{`
        @keyframes magicSparkle {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        @keyframes magicPulse {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(151, 128, 65, 0.2);
          }
          50% { 
            box-shadow: 0 0 20px rgba(151, 128, 65, 0.6), 0 0 30px rgba(151, 128, 65, 0.4);
          }
        }
        .custom-button-tertiary {
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          min-width: auto !important;
          width: auto !important;
          outline: none !important;
        }
        .custom-button-tertiary .vkuiButton__content {
          padding: 0 !important;
          margin: 0 !important;
        }
        .custom-button-tertiary .vkuiButton__content:first-child {
          padding-left: 0 !important;
        }
        .custom-button-tertiary .vkuiButton__content:last-child {
          padding-right: 0 !important;
        }
        .custom-button-tertiary:hover {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .custom-button-tertiary:hover .vkuiButton__content {
          padding: 0 !important;
        }
        .custom-button-tertiary:active {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .custom-button-tertiary:active .vkuiButton__content {
          padding: 0 !important;
        }
        .custom-button-tertiary:focus {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          outline: none !important;
        }
        .custom-button-tertiary:focus .vkuiButton__content {
          padding: 0 !important;
        }
        .custom-button-tertiary > * {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <Button
        mode="primary"
        size={size}
        onClick={onClick}
        disabled={disabled}
        stretched={stretched}
        style={getButtonStyles()}
        className={variant === 'tertiary' ? 'custom-button-tertiary' : undefined}
        onMouseEnter={() => !disabled && !isTouch && setIsHovered(true)}
        onMouseLeave={() => !disabled && !isTouch && setIsHovered(false)}
        onMouseDown={() => !disabled && setIsActive(true)}
        onMouseUp={() => !disabled && setIsActive(false)}
        onTouchStart={() => !disabled && setIsActive(true)}
        onTouchEnd={() => !disabled && setIsActive(false)}
      >
        <div style={getSparkleEffect()} />
        <span style={{ 
          position: 'relative', 
          zIndex: 1,
          fontSize: isMobile ? getMobileFontSize() : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: icon ? (isMobile ? '6px' : '8px') : '0',
          margin: variant === 'tertiary' ? '0' : undefined,
          padding: variant === 'tertiary' ? '0' : undefined,
        }}>
          {icon && (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center',
              width: getIconSize(),
              height: getIconSize(),
              flexShrink: 0
            }}>
              {typeof icon === 'string' ? (
                <img 
                  src={icon} 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                icon
              )}
            </span>
          )}
          {children}
        </span>
      </Button>
    </>
  );
};