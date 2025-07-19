import React from 'react';
import { Button } from '@vkontakte/vkui';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 's' | 'm' | 'l';
  stretched?: boolean;
  style?: React.CSSProperties;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'secondary',
  children,
  onClick,
  disabled = false,
  size = 'm',
  stretched = false,
  style = {}
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const getButtonStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      minHeight: '44px',
      textTransform: 'uppercase',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '3px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        border: '3px solid #978041',
        background: isHovered 
          ? 'linear-gradient(90deg, #CFAE1D 0%, #714F0D 100%)'
          : 'linear-gradient(90deg, #CFAE1D 0%, #714F0D 100%)',
        color: 'white',
        boxShadow: isHovered 
          ? '0 0 20px rgba(227, 199, 122, 0.6), 0 0 40px rgba(227, 199, 122, 0.4), 0 0 60px rgba(227, 199, 122, 0.2), inset 0 0 0 3px rgba(0, 0, 0, 0.3)'
          : '0 0 10px rgba(227, 199, 122, 0.3), inset 0 0 0 3px rgba(0, 0, 0, 0.3)',
        transform: isActive ? 'scale(0.98)' : (isHovered ? 'translateY(-2px) scale(1.02)' : 'none'),
      };
    }

    // Secondary style с магическими эффектами
    return {
      ...baseStyles,
      border: '3px solid rgba(151, 128, 65, 1)',
      backgroundColor: isHovered ? 'rgba(151, 128, 65, 0.15)' : 'transparent',
      color: 'white',
      boxShadow: isHovered 
        ? '0 0 15px rgba(151, 128, 65, 0.5), 0 0 30px rgba(151, 128, 65, 0.3), inset 0 0 15px rgba(151, 128, 65, 0.1)'
        : '0 0 5px rgba(151, 128, 65, 0.2)',
      transform: isActive ? 'scale(0.97)' : (isHovered ? 'translateY(-1px) scale(1.01)' : 'none'),
    };
  };

  const getSparkleEffect = (): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isHovered 
      ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)'
      : 'none',
    animation: isHovered ? 'magicSparkle 2s infinite' : 'none',
    pointerEvents: 'none',
    borderRadius: '3px'
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
      `}</style>
      <Button
        mode="primary"
        size={size}
        onClick={onClick}
        disabled={disabled}
        stretched={stretched}
        style={getButtonStyles()}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        onMouseDown={() => !disabled && setIsActive(true)}
        onMouseUp={() => !disabled && setIsActive(false)}
      >
        <div style={getSparkleEffect()} />
        <span style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </span>
      </Button>
    </>
  );
}; 