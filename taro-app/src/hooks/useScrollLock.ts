import { useEffect } from 'react';

/**
 * Хук для блокировки скролла на странице
 * Используется в модальных окнах и попапах для предотвращения скролла фона
 */
export const useScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      
      return () => {
        // Восстанавливаем скролл
        const scrollY = parseInt(document.body.style.top || '0') * -1;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // Восстанавливаем позицию скролла
        window.scrollTo(0, scrollY);
      };
    }
  }, [isActive]);
};
