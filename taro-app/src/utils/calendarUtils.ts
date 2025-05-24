import { store } from '../store';
import { addCalendarActivity, CalendarActivity } from '../store/slices/calendarSlice';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const saveActivityToCalendar = async (
  type: CalendarActivity['type'],
  title: string,
  summary: string,
  fullContent?: string
): Promise<void> => {
  const today = formatDate(new Date());
  const activity: CalendarActivity = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    summary,
    fullContent,
    timestamp: Date.now(),
  };

  await store.dispatch(addCalendarActivity(today, activity));
};

export const saveTarotReadingToCalendar = async (
  spreadName: string,
  deckName: string,
  cards: string[],
  fullReading?: string
): Promise<void> => {
  const title = `Расклад "${spreadName}"`;
  const summary = `Колода: ${deckName}. Карты: ${cards.slice(0, 3).join(', ')}${cards.length > 3 ? '...' : ''}`;
  
  await saveActivityToCalendar('tarot_reading', title, summary, fullReading);
};

export const saveAffirmationToCalendar = async (
  affirmationText: string,
  fullAffirmationData?: unknown
): Promise<void> => {
  const title = 'Ежедневная аффирмация';
  const summary = affirmationText.length > 100 
    ? `${affirmationText.substring(0, 100)}...` 
    : affirmationText;
  
  // Сохраняем полную информацию об аффирмации
  const fullContent = fullAffirmationData ? JSON.stringify(fullAffirmationData) : affirmationText;
  
  await saveActivityToCalendar('affirmation', title, summary, fullContent);
}; 