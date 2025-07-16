import { FC } from 'react';
import { Button } from '@vkontakte/vkui';

interface StarButtonProps {
  size?: 's' | 'm' | 'l';
  mode?: 'primary' | 'secondary' | 'tertiary';
  stretched?: boolean;
  onClick?: () => void;
}

export const StarButton: FC<StarButtonProps> = ({ 
  size = 's', 
  mode = 'primary', 
  stretched = false,
  onClick 
}) => {
  const handleClick = () => {
    // TODO: Реализовать функциональность добавления звезд
    console.log('Добавить звезды');
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      mode={mode}
      size={size}
      stretched={stretched}
      onClick={handleClick}
    >
      ⭐ Добавить звезды
    </Button>
  );
}; 