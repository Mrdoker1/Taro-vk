import { useRouteNavigator, useFirstPageCheck } from '@vkontakte/vk-mini-apps-router';

/**
 * Безопасная навигация назад с использованием встроенных возможностей vk-mini-apps-router
 */
export const useSafeNavigation = () => {
  const routeNavigator = useRouteNavigator();
  const isFirstPage = useFirstPageCheck();

  /**
   * Безопасный переход назад
   * Если это первая страница - переходим на главную, иначе - назад по истории
   */
  const safeBack = () => {
    if (isFirstPage) {
      // Если это первая загруженная страница, переходим на главную
      routeNavigator.push('/');
    } else {
      // Иначе используем встроенную навигацию назад
      routeNavigator.back();
    }
  };

  /**
   * Переход на главную страницу
   */
  const goHome = () => {
    routeNavigator.push('/');
  };

  /**
   * Переход на указанную страницу
   */
  const navigateTo = (path: string) => {
    routeNavigator.push(path);
  };

  return {
    safeBack,
    goHome,
    navigateTo,
    isFirstPage,
    routeNavigator
  };
};
