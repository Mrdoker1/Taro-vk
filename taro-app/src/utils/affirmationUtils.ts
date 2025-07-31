import { ParsedAffirmation } from '../types/affirmation';
import { getCurrentTopic } from '../constants/affirmation';
import bridge from '../bridge';

// Создание содержимого файла для скачивания
export const createFileContent = (
  parsedAffirmation: ParsedAffirmation,
  promptMode: 'preset' | 'custom',
  customPrompt: string,
  selectedTopic: string
): string => {
  if (!parsedAffirmation || parsedAffirmation.error) return '';
  
  const topic = getCurrentTopic(promptMode, customPrompt, selectedTopic);
  const currentDate = new Date().toLocaleDateString('ru-RU');
  const currentTime = new Date().toLocaleTimeString('ru-RU');
  
  let content = `🌞 ЕЖЕДНЕВНЫЕ АФФИРМАЦИИ 🌞\n\n`;
  content += `🎯 ТЕМА: ${topic}\n`;
  content += `📅 ДАТА: ${currentDate}\n`;
  content += `🕐 ВРЕМЯ: ${currentTime}\n\n`;
  content += `✨ ${parsedAffirmation.title}\n\n`;
  
  parsedAffirmation.sections.forEach((section, index) => {
    content += `${index + 1}. ${section.title}\n${section.text}\n\n`;
  });
  
  if (parsedAffirmation.usage) {
    content += `🔧 КАК ИСПОЛЬЗОВАТЬ:\n${parsedAffirmation.usage}\n\n`;
  }
  
  content += `Создано в приложении Seluna - расклады и советы Таро\nДата создания: ${currentDate} ${currentTime}`;
  return content;
};

// Функция для скачивания файла
export const downloadAffirmation = async (
  parsedAffirmation: ParsedAffirmation,
  promptMode: 'preset' | 'custom',
  customPrompt: string,
  selectedTopic: string
) => {
  const content = createFileContent(parsedAffirmation, promptMode, customPrompt, selectedTopic);
  if (!content) return;

  try {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const topic = getCurrentTopic(promptMode, customPrompt, selectedTopic);
    const topicName = topic.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    link.download = `Аффирмации-${topicName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
  }
};

// Функция для публикации в VK
export const shareToVK = async (
  parsedAffirmation: ParsedAffirmation,
  promptMode: 'preset' | 'custom',
  customPrompt: string,
  selectedTopic: string
) => {
  if (!parsedAffirmation || parsedAffirmation.error) return;

  try {
    const topic = getCurrentTopic(promptMode, customPrompt, selectedTopic);
    let shareText = `🌞 Ежедневные аффирмации\n\n🎯 Тема: ${topic}\n\n✨ ${parsedAffirmation.title}\n\n`;

    if (parsedAffirmation.sections.length > 0) {
      const firstSection = parsedAffirmation.sections[0];
      let sectionText = `${firstSection.title}: ${firstSection.text}`;
      if (sectionText.length > 150) {
        sectionText = sectionText.substring(0, 150) + '...';
      }
      shareText += `${sectionText}\n\n`;
    }
    
    shareText += `#Аффирмации #ПозитивноеМышление #ВКМиниАпп`;

    await bridge.send('VKWebAppShowWallPostBox', { message: shareText });
  } catch (error) {
    console.error('Ошибка при публикации в VK:', error);
  }
};
