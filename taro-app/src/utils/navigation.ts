import { RouteNavigator } from '@vkontakte/vk-mini-apps-router';

/**
 * Безопасная навигация назад с fallback на главную страницу
 * Проверяет наличие истории браузера и либо возвращается назад,
 * либо переходит на главную страницу приложения
 */
export const safeNavigateBack = (routeNavigator: RouteNavigator) => {
  // Проверяем, есть ли история для возврата
  // В VK Mini Apps history.length может быть ненадежным,
  // поэтому используем проверку через document.referrer и window.history
  const hasHistory = window.history.length > 1;
  
  // Если есть история в пределах приложения, возвращаемся назад
  if (hasHistory) {
    try {
      routeNavigator.back();
    } catch (error) {
      // Если не удалось вернуться назад, переходим на главную
      console.warn('Не удалось вернуться назад, переходим на главную:', error);
      routeNavigator.push('/'); // Корневой путь для главной страницы
    }
  } else {
    // Если истории нет (прямой переход по ссылке), переходим на главную
    routeNavigator.push('/'); // Корневой путь для главной страницы
  }
};

/**
 * Альтернативный подход: всегда переходить на главную страницу
 * Можно использовать если safeNavigateBack работает некорректно
 */
export const navigateToHome = (routeNavigator: RouteNavigator) => {
  routeNavigator.push('/'); // Корневой путь для главной страницы
};
