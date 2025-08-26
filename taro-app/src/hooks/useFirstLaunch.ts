import { useState, useEffect } from 'react';

const FIRST_LAUNCH_KEY = 'taro_vk_first_launch';

export const useFirstLaunch = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Проверяем, был ли уже первый запуск для показа специального контента
    const hasLaunchedBefore = localStorage.getItem(FIRST_LAUNCH_KEY);
    
    if (hasLaunchedBefore) {
      setIsFirstLaunch(false);
    } else {
      setIsFirstLaunch(true);
    }
    
    // Но лоадер показываем всегда при каждом запуске
    setIsLoading(true);
  }, []);

  const completeFirstLaunch = () => {
    // Отмечаем, что первый запуск завершен (для будущих фич)
    localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    setIsLoading(false);
  };

  // Функция для сброса (для тестирования)
  const resetFirstLaunch = () => {
    localStorage.removeItem(FIRST_LAUNCH_KEY);
    setIsFirstLaunch(true);
    setIsLoading(true);
  };

  return {
    isFirstLaunch,
    isLoading,
    completeFirstLaunch,
    resetFirstLaunch
  };
};
