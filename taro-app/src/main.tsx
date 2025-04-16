import { createRoot } from 'react-dom/client';
import { AppConfig } from './AppConfig.tsx';
// Импортируем наш настроенный мост
import './bridge.ts';

// Импорт eruda для отладки в мобильных браузерах
if (import.meta.env.MODE === 'development') {
  import('./eruda.ts');
}

createRoot(document.getElementById('root')!).render(<AppConfig />);
