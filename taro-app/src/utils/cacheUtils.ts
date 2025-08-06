/**
 * Утилиты для кэширования
 */

interface CacheEntry {
  timestamp: number;
  expiresIn?: number;
  [key: string]: unknown;
}

// Очистка устаревшего кэша
export const clearExpiredCache = (cache: Record<string, CacheEntry>, maxAge: number) => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  Object.entries(cache).forEach(([key, data]) => {
    if (data.timestamp && now - data.timestamp > maxAge) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    delete cache[key];
  });
  
  return cache;
};

// Получение размера кэша
export const getCacheSize = (cache: Record<string, CacheEntry>): number => {
  return Object.keys(cache).length;
};

// Получение информации о кэше для отладки
export const getCacheInfo = (cache: Record<string, CacheEntry>) => {
  const now = Date.now();
  return Object.entries(cache).map(([key, data]) => ({
    key,
    age: now - (data.timestamp || 0),
    isExpired: data.expiresIn ? now - data.timestamp > data.expiresIn : false
  }));
};
