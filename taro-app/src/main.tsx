import { createRoot } from 'react-dom/client';
import { AppConfig } from './AppConfig.tsx';
// Импортируем наш настроенный мост
import './bridge.ts';
// Импортируем кастомные стили для табов гороскопа
import './styles/horoscope-tabs.css';

// Импорт eruda для отладки в мобильных браузерах
if (import.meta.env.MODE === 'development') {
  import('./eruda.ts');
}

createRoot(document.getElementById('root')!).render(<AppConfig />);
