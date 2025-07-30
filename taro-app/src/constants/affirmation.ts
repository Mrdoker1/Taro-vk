import { AffirmationTopic } from '../types/affirmation';

// Импорт иконок для аффирмаций
import affirmationSunIcon from '../assets/affir-sun.svg';
import affirmationContIcon from '../assets/affir-cont.svg';
import affirmationEnergIcon from '../assets/affir-energ.svg';
import affirmationMoonIcon from '../assets/affir-moon.svg';

// Список предустановленных тем для аффирмаций
export const AFFIRMATION_TOPICS: AffirmationTopic[] = [
  { value: 'self-love', label: 'Любовь к себе' },
  { value: 'success', label: 'Успех' },
  { value: 'confidence', label: 'Уверенность в себе' },
  { value: 'abundance', label: 'Изобилие' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'health', label: 'Здоровье' },
  { value: 'peace', label: 'Спокойствие' },
  { value: 'gratitude', label: 'Благодарность' },
  { value: 'motivation', label: 'Мотивация' },
  { value: 'growth', label: 'Личностный рост' }
];

export const AFFIRMATION_ICONS = [
  affirmationSunIcon, 
  affirmationContIcon, 
  affirmationEnergIcon, 
  affirmationMoonIcon
];

// Утилитарные функции
export const getAffirmationIcon = (index: number): string => 
  AFFIRMATION_ICONS[index % AFFIRMATION_ICONS.length];

export const getCurrentTopic = (
  promptMode: 'preset' | 'custom',
  customPrompt: string,
  selectedTopic: string
): string => 
  promptMode === 'custom' 
    ? customPrompt 
    : AFFIRMATION_TOPICS.find(t => t.value === selectedTopic)?.label || 'персональной темы';
