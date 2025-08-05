import { FC, useState } from 'react';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { DEFAULT_VIEW_PANELS } from '../routes';
import starIcon from '../assets/star.svg';

interface StarButtonProps {
  size?: 's' | 'm' | 'l';
  stretched?: boolean;
  onClick?: () => void;
}

export const StarButton: FC<StarButtonProps> = ({ 
  size = 's', 
  stretched = false,
  onClick 
}) => {
  // TODO: Получать реальное количество звезд из store
  const [starCount] = useState(15);
  const [isHovered, setIsHovered] = useState(false);
  const routeNavigator = useRouteNavigator();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // По умолчанию переходим на страницу покупки звезд
      routeNavigator.push(`/${DEFAULT_VIEW_PANELS.STARS_PURCHASE}`);
    }
  };

  // Определяем размеры в зависимости от size
  const sizeStyles = {
    s: {
      height: '32px',
      fontSize: '14px', // text-sm
      iconSize: '20px',
      padding: '0 8px',
      buttonPadding: '0 12px'
    },
    m: {
      height: '40px',
      fontSize: '14px', // text-sm как в оригинале
      iconSize: '28px', // w-7 = 28px как в оригинале
      padding: '0 12px',
      buttonPadding: '0 16px'
    },
    l: {
      height: '48px',
      fontSize: '16px',
      iconSize: '32px',
      padding: '0 16px',
      buttonPadding: '0 20px'
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: currentSize.height,
        backgroundColor: 'rgba(51, 41, 85, 1)',
        borderRadius: '100px',
        overflow: 'hidden',
        width: stretched ? '100%' : 'auto'
      }}
    >
      {/* Левая часть - счетчик звезд */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: currentSize.padding,
          color: 'white',
          fontSize: currentSize.fontSize,
          fontWeight: '500', // font-medium
          letterSpacing: '1px', // tracking-[1px] как в оригинале
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <img
          src={starIcon}
          alt="Star icon"
          style={{
            width: currentSize.iconSize,
            height: currentSize.iconSize,
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
        <span>{starCount}</span>
      </div>
      
      {/* Правая часть - кнопка */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(255, 255, 255, 0.08)',
          border: 'none',
          color: 'white',
          fontSize: currentSize.fontSize,
          fontWeight: '400', // font-normal как в оригинале
          padding: currentSize.buttonPadding,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          borderRadius: '0 100px 100px 0',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: stretched ? 1 : 'none',
          minWidth: size === 's' ? '100px' : size === 'm' ? '120px' : '140px',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        Добавить звезды
      </button>
    </div>
  );
}; 