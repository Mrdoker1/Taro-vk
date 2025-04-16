/**
 * Конфигурация моста VK Bridge с поддержкой моков для разработки и GitHub Pages
 */
import vkBridgeProd from '@vkontakte/vk-bridge';
import vkBridgeMock from '@vkontakte/vk-bridge-mock';

// Определяем, находимся ли мы в правильном контексте VK Mini Apps
const isVkMiniApp = vkBridgeProd.isWebView() || window.self !== window.top;

// Проверяем, запущено ли приложение на GitHub Pages
const isGhPages = window.location.hostname.includes('github.io') || 
                 window.location.hostname.includes('pages.github');

// Используем мок для разработки или для GitHub Pages
const shouldUseMock = !isVkMiniApp || isGhPages;

// Настраиваем vk-bridge-mock (опционально можно кастомизировать данные)
if (shouldUseMock) {
  // Можно кастомизировать данные мока, если нужно
  // Например:
  // import { response } from '@vkontakte/vk-bridge-mock';
  // response.VKWebAppGetUserInfo.data = {
  //   id: 12345,
  //   first_name: 'GitHub',
  //   last_name: 'User',
  //   ...
  // };
}

// Выбираем подходящую реализацию моста
const bridge = shouldUseMock ? vkBridgeMock : vkBridgeProd;

// Добавляем логирование в режиме разработки
if (import.meta.env.DEV) {
  bridge.subscribe((event) => {
    console.log('[VK Bridge]', event);
  });
}

// Инициализируем мост
try {
  bridge.send('VKWebAppInit');
  console.log(`VKWebAppInit успешно отправлен${shouldUseMock ? ' (используется мок)' : ''}`);
} catch (error) {
  console.error('Ошибка при инициализации VK Bridge:', error);
}

export default bridge; 