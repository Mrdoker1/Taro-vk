import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { MobileBottomNavigation } from './MobileBottomNavigation';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const isMobile = useResponsive();

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: isMobile ? '70px' : '0', // Возвращаем стандартный отступ снизу для мобильного меню
      position: 'relative'
    }}>
      {children}
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};
