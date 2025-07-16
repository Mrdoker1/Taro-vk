import { FC, ReactNode } from 'react';
import { Div } from '@vkontakte/vkui';

interface AppHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export const AppHeader: FC<AppHeaderProps> = ({ left, center, right }) => {
  return (
    <Div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        height: '44px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {left}
      </div>
      {center && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {center}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {right}
      </div>
    </Div>
  );
}; 