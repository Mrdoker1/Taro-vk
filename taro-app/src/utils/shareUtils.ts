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
 * Делится активностью в VK через VKWebAppShare согласно официальной документации
 */
export const shareActivityToVK = async (activity: CalendarActivity): Promise<void> => {
  if (!activity.fullContent) {
    console.error('Нет данных для поделиться');
    return;
  }

  try {
    let shareText = '';

    if (activity.type === 'tarot_reading') {
      const data: TarotData = JSON.parse(activity.fullContent);
      
      // Создаем краткий текст для сообщения (максимум 100 символов)
      shareText = `🔮 Расклад Таро: ${activity.title}`;
      
      if (data.question && shareText.length < 80) {
        const questionPreview = data.question.length > 50 ? 
          data.question.substring(0, 47) + '...' : data.question;
        shareText += ` • ${questionPreview}`;
      }
      
      // Обрезаем до 100 символов если нужно
      if (shareText.length > 100) {
        shareText = shareText.substring(0, 97) + '...';
      }
      
    } else if (activity.type === 'affirmation') {
      const data: AffirmationData = JSON.parse(activity.fullContent);
      shareText = `🌞 Ежедневные аффирмации`;
      
      if (data.sections && data.sections.length > 0 && shareText.length < 70) {
        const firstSection = data.sections[0];
        const preview = firstSection.title.length > 30 ? 
          firstSection.title.substring(0, 27) + '...' : firstSection.title;
        shareText += ` • ${preview}`;
      }
      
      // Обрезаем до 100 символов если нужно
      if (shareText.length > 100) {
        shareText = shareText.substring(0, 97) + '...';
      }
      
    } else {
      // Для других типов активностей
      shareText = activity.title.length > 90 ? 
        activity.title.substring(0, 87) + '...' : activity.title;
    }

    // Используем правильный VKWebAppShare метод согласно документации
    try {
      // Сначала пытаемся с текстом (для мобильных платформ)
      const shareParams: VKShareParams = {
        link: window.location.href,
        text: shareText
      };
      
      const result = await bridge.send('VKWebAppShare', shareParams);
      
      console.log('Успешно открыто окно поделиться в VK с текстом:', result);
      
      // Проверяем результат (result может быть массивом или объектом)
      if (Array.isArray(result) && result.length > 0) {
        console.log('Сообщения отправлены:', result);
      } else if (result && typeof result === 'object') {
        console.log('Результат поделиться:', result);
      }
      
    } catch (shareWithTextError) {
      console.log('Не удалось поделиться с текстом, пробуем без текста:', shareWithTextError);
      
      // Фолбэк: пытаемся без параметра text
      const result = await bridge.send('VKWebAppShare', {
        link: window.location.href
      });
      
      console.log('Успешно открыто окно поделиться в VK без текста:', result);
      
      // Уведомляем пользователя, что текст нужно добавить вручную
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('🎉 Окно поделиться открыто!\n📋 Краткое описание скопировано в буфер - добавьте его к сообщению.');
      }
    }
    
  } catch (error) {
    console.error('Ошибка при попытке поделиться в VK:', error);
    
    // Фолбэк - копируем подробный текст в буфер обмена
    try {
      let fullText = '';
      
      if (activity.type === 'tarot_reading') {
        const data: TarotData = JSON.parse(activity.fullContent);
        fullText = `🔮✨ Расклад Таро: ${activity.title} ✨🔮\n\n`;
        
        if (data.question) {
          fullText += `🤔 Мой вопрос: "${data.question}"\n\n`;
        }

        if (data.cards && data.cards.length > 0) {
          fullText += `🃏 Выпали карты:\n`;
          data.cards.slice(0, 3).forEach((card, index) => {
            const reversedIcon = card.isReversed ? '🔄' : '⬆️';
            fullText += `${index + 1}. ${card.cardName} ${reversedIcon}\n`;
          });
          if (data.cards.length > 3) {
            fullText += `... и еще ${data.cards.length - 3} карт\n`;
          }
          fullText += '\n';
        }

        if (data.interpretation) {
          let interpretation = data.interpretation;
          if (interpretation.length > 180) {
            interpretation = interpretation.substring(0, 180) + '...';
          }
          fullText += `💫 Краткое толкование:\n${interpretation}\n\n`;
        }
        
        fullText += `Хочешь узнать, что говорят карты тебе? 🌟\n\n`;
        fullText += `#ТароГадание #Таро #Эзотерика #ВКМиниАпп #Seluna`;
        
      } else if (activity.type === 'affirmation') {
        const data: AffirmationData = JSON.parse(activity.fullContent);
        fullText = `🌞✨ Мои ежедневные аффирмации ✨🌞\n\n`;

        if (data.sections && data.sections.length > 0) {
          const firstSection = data.sections[0];
          fullText += `💎 ${firstSection.title}:\n"${firstSection.text}"\n\n`;
        }
        
        fullText += `Начни день с позитива! 🌈\n\n`;
        fullText += `#Аффирмации #ПозитивноеМышление #Мотивация #ВКМиниАпп #Seluna`;
        
      } else {
        fullText = `📝 ${activity.title}\n\n${activity.summary}\n\n#ВКМиниАпп #Seluna`;
      }

      // Пытаемся скопировать в буфер обмена как фолбэк
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
        alert('📋 Не удалось открыть окно поделиться ВК.\n\nТекст скопирован в буфер обмена!\nВы можете вставить его в сообщение или пост вручную.');
      } else {
        alert('❌ Не удалось открыть окно поделиться.\nПопробуйте позже или обратитесь к поддержке.');
      }
      
    } catch (fallbackError) {
      console.error('Ошибка в фолбэке:', fallbackError);
      alert('❌ Произошла ошибка при попытке поделиться.\nПопробуйте позже.');
    }
  }
};
