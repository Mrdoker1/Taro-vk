import React from 'react';
import { Text } from '@vkontakte/vkui';
import { CustomSelect } from './CustomSelect';
import { CustomTextarea } from './CustomTextarea';
import { AFFIRMATION_TOPICS } from '../constants/affirmation';
import { PromptMode } from '../types/affirmation';

interface AffirmationFormProps {
  promptMode: PromptMode;
  selectedTopic: string;
  customPrompt: string;
  generationError: string | null;
  onTopicChange: (value: string) => void;
  onCustomPromptChange: (value: string) => void;
  onModeChange: (mode: PromptMode) => void;
}

export const AffirmationForm: React.FC<AffirmationFormProps> = ({
  promptMode,
  selectedTopic,
  customPrompt,
  generationError,
  onTopicChange,
  onCustomPromptChange,
  onModeChange
}) => {
  const handleTopicSelect = (value: string) => {
    onTopicChange(value);
    onModeChange('preset');
  };

  const handleCustomPromptChange = (value: string) => {
    onCustomPromptChange(value);
    onModeChange('custom');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '16px',
      width: '100%'
    }}>
      <div style={{ width: '100%' }}>
        <CustomSelect
          value={promptMode === 'preset' ? selectedTopic : ''}
          options={AFFIRMATION_TOPICS}
          label="Тема аффирмации"
          placeholder="Выберите тему"
          onChange={handleTopicSelect}
        />
        
        <Text style={{ 
          color: '#ffffff', 
          textAlign: 'center',
          margin: '12px 0',
          fontSize: '14px',
          opacity: 0.8
        }}>
          или
        </Text>
        
        <CustomTextarea
          value={customPrompt}
          placeholder="Введите свою тему для аффирмации"
          label="Персональная тема"
          onChange={handleCustomPromptChange}
        />
      </div>
      
      {generationError && (
        <Text style={{ 
          color: '#ff6b6b', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Ошибка: {generationError}
        </Text>
      )}
    </div>
  );
};
