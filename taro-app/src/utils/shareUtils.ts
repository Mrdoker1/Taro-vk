import bridge from '@vkontakte/vk-bridge';
import { CalendarActivity } from '../store/slices/calendarSlice';

// Интерфейс для карты в расскладе Таро
interface CardData {
  position: number;
  cardName: string;
  positionLabel: string;
  isReversed: boolean;
}

// Интерфейс для позиции в расскладе
interface PositionData {
  index: number;
  interpretation: string;
}

// Интерфейс для данных Таро расклада
interface TarotData {
  question?: string;
  cards?: CardData[];
  interpretation?: string;
  detailedPositions?: PositionData[];
}

// Интерфейс для данных аффирмации
interface AffirmationData {
  sections?: Array<{ title: string; text: string }>;
  usage?: string;
}

/**
 * Создает содержимое файла для скачивания расклада Таро
 */
const createTarotFileContent = (activity: CalendarActivity, data: TarotData): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  const activityDate = new Date(activity.timestamp).toLocaleDateString('ru-RU');
  const activityTime = new Date(activity.timestamp).toLocaleTimeString('ru-RU');
  
  let content = `═══════════════════════════════════════════════════════════════
                        🔮 РАСКЛАД ТАРО 🔮
═══════════════════════════════════════════════════════════════

📊 РАСКЛАД: ${activity.title}
📅 ДАТА СОЗДАНИЯ: ${activityDate}
🕐 ВРЕМЯ: ${activityTime}

`;
  
  if (data.question) {
    content += `❓ ВАША ТЕМА/ВОПРОС:
${data.question}

`;
  }

  if (data.cards && data.cards.length > 0) {
    content += `🃏 КАРТЫ В РАСКЛАДЕ:
───────────────────────────────────────────────────────────────

`;
    data.cards.forEach((card, index) => {
      content += `${index + 1}. ${card.positionLabel}: ${card.cardName} ${card.isReversed ? '(Перевернутая)' : '(Прямая)'}
`;
    });
    content += `
`;
  }

  if (data.interpretation) {
    content += `✨ ОБЩЕЕ ТОЛКОВАНИЕ:
${data.interpretation}

`;
  }

  if (data.detailedPositions && data.detailedPositions.length > 0) {
    content += `🃏 ДЕТАЛЬНОЕ ТОЛКОВАНИЕ КАРТ:
───────────────────────────────────────────────────────────────

`;
    
    data.detailedPositions.forEach((pos, index) => {
      const card = data.cards?.find(c => c.position === pos.index);
      const positionLabel = card?.positionLabel || `Позиция ${pos.index}`;
      const cardName = card?.cardName || 'Неизвестная карта';
      const reversedText = card?.isReversed ? ' (Перевернутая)' : '';
      
      content += `${index + 1}. ${positionLabel}
🃏 Карта: ${cardName}${reversedText}

${pos.interpretation}

`;
    });
  }

  content += `═══════════════════════════════════════════════════════════════
Создано в приложении Seluna - расклады и советы Таро
Дата скачивания: ${currentDate}
═══════════════════════════════════════════════════════════════`;

  return content;
};

/**
 * Создает содержимое файла для скачивания аффирмации
 */
const createAffirmationFileContent = (activity: CalendarActivity, data: AffirmationData): string => {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  const activityDate = new Date(activity.timestamp).toLocaleDateString('ru-RU');
  const activityTime = new Date(activity.timestamp).toLocaleTimeString('ru-RU');
  
  let content = `═══════════════════════════════════════════════════════════════
                       🌞 ЕЖЕДНЕВНЫЕ АФФИРМАЦИИ 🌞
═══════════════════════════════════════════════════════════════

📅 ДАТА СОЗДАНИЯ: ${activityDate}
🕐 ВРЕМЯ: ${activityTime}

`;

  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section, index) => {
      content += `${index + 1}. ${section.title.toUpperCase()}
───────────────────────────────────────────────────────────────

${section.text}

`;
    });
  }

  if (data.usage) {
    content += `💡 КАК ИСПОЛЬЗОВАТЬ:
───────────────────────────────────────────────────────────────

${data.usage}

`;
  }

  content += `═══════════════════════════════════════════════════════════════
Создано в приложении Seluna - расклады и советы Таро
Дата скачивания: ${currentDate}
═══════════════════════════════════════════════════════════════`;

  return content;
};

/**
 * Определяет, является ли устройство мобильным
 */
const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768 ||
         'ontouchstart' in window;
};

/**
 * Определяет, поддерживает ли браузер Web Share API
 */
const isWebShareSupported = (): boolean => {
  return typeof navigator.share === 'function';
};

/**
 * Универсальная функция для "скачивания" контента
 * На мобильных использует Web Share API или VK Bridge для шеринга
 * На десктопе - классическое скачивание файла
 */
export const downloadOrShareActivity = async (activity: CalendarActivity): Promise<void> => {
  if (!activity.fullContent) {
    console.error('Нет данных для скачивания');
    return;
  }

  try {
    let content = '';
    let title = '';

    if (activity.type === 'tarot_reading') {
      const data: TarotData = JSON.parse(activity.fullContent);
      content = createTarotFileContent(activity, data);
      title = `🔮 Расклад Таро: ${activity.title}`;
    } else if (activity.type === 'affirmation') {
      const data: AffirmationData = JSON.parse(activity.fullContent);
      content = createAffirmationFileContent(activity, data);
      title = `✨ Аффирмации`;
    } else {
      content = `${activity.title}\n\n${activity.summary}\n\nСоздано: ${new Date(activity.timestamp).toLocaleString('ru-RU')}`;
      title = activity.title;
    }

    // Если мобильное устройство - используем шеринг
    if (isMobileDevice()) {
      // Пробуем Web Share API
      if (isWebShareSupported()) {
        try {
          await navigator.share({
            title: title,
            text: content
          });
          console.log('Поделились через Web Share API');
          return;
        } catch (shareError) {
          console.log('Web Share API отменен пользователем или недоступен');
        }
      }

      // Fallback на VK Bridge для копирования
      try {
        await bridge.send('VKWebAppCopyText', { text: content });
        console.log('Текст скопирован через VK Bridge');
        alert('Текст скопирован в буфер обмена!');
        return;
      } catch (vkError) {
        console.log('VK Bridge копирование недоступно');
      }

      // Последний fallback - обычный Clipboard API
      try {
        await navigator.clipboard.writeText(content);
        console.log('Текст скопирован через Clipboard API');
        alert('Текст скопирован в буфер обмена!');
        return;
      } catch (clipboardError) {
        console.log('Clipboard API недоступен');
        alert('Выделите текст и скопируйте вручную');
      }
    } else {
      // Десктоп - обычное скачивание файла
      await downloadActivity(activity);
    }

  } catch (error) {
    console.error('Ошибка при обработке контента:', error);
  }
};

/**
 * Скачивает активность как текстовый файл
 */
export const downloadActivity = async (activity: CalendarActivity): Promise<void> => {
  if (!activity.fullContent) {
    console.error('Нет данных для скачивания');
    return;
  }

  try {
    let content = '';
    let fileName = '';

    if (activity.type === 'tarot_reading') {
      const data: TarotData = JSON.parse(activity.fullContent);
      content = createTarotFileContent(activity, data);
      const title = activity.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      fileName = `Таро-${title}-${new Date(activity.timestamp).toISOString().split('T')[0]}.txt`;
    } else if (activity.type === 'affirmation') {
      const data: AffirmationData = JSON.parse(activity.fullContent);
      content = createAffirmationFileContent(activity, data);
      fileName = `Аффирмации-${new Date(activity.timestamp).toISOString().split('T')[0]}.txt`;
    } else {
      // Для других типов активностей
      content = `${activity.title}\n\n${activity.summary}\n\nСоздано: ${new Date(activity.timestamp).toLocaleString('ru-RU')}`;
      fileName = `Активность-${new Date(activity.timestamp).toISOString().split('T')[0]}.txt`;
    }

    // Создаем blob с UTF-8 BOM для корректного отображения
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Файл скачан:', fileName);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
  }
};

// Интерфейс для параметров VKWebAppShare с поддержкой text
interface VKShareParams {
  link?: string;
  text?: string;
  user_id?: number;
}

/**
 * Делится активностью в VK через VKWebAppShare согласно документации
 */
export const shareActivityToVK = async (): Promise<void> => {
  try {
    // Используем правильную ссылку на VK мини-приложение и добавляем текст
    const shareParams: VKShareParams = {
      link: 'https://vk.com/app53429194#/',
      text: '🔮✨ Расклады Таро и аффирмации! Узнай, что говорят карты именно тебе 🌟 #Таро #Seluna'
    };
    
    const result = await bridge.send('VKWebAppShare', shareParams);
    
    console.log('Окно поделиться открыто успешно:', result);
    
    // Проверяем результат согласно документации
    if (result && Array.isArray(result) && result.length > 0) {
      console.log('Сообщения отправлены пользователям:', result);
    } else if (result && typeof result === 'object') {
      console.log('Результат поделиться:', result);
    }
    
  } catch (error) {
    console.error('Ошибка при попытке поделиться в VK:', error);
  }
};

/**
 * Подготавливает контент активности для отображения в модальном окне
 */
export const prepareActivityContent = (activity: CalendarActivity): string => {
  if (!activity.fullContent) {
    return 'Нет данных для отображения';
  }

  try {
    if (activity.type === 'tarot_reading') {
      const data: TarotData = JSON.parse(activity.fullContent);
      return createTarotFileContent(activity, data);
    } else if (activity.type === 'affirmation') {
      const data: AffirmationData = JSON.parse(activity.fullContent);
      return createAffirmationFileContent(activity, data);
    } else {
      return `${activity.title}\n\n${activity.summary}\n\nСоздано: ${new Date(activity.timestamp).toLocaleString('ru-RU')}`;
    }
  } catch (error) {
    console.error('Ошибка при подготовке контента:', error);
    return 'Ошибка при загрузке данных';
  }
};
