import React from 'react';
import { Text, IconButton } from '@vkontakte/vkui';
import { Icon24Refresh } from '@vkontakte/icons';
import { CustomSelect } from './CustomSelect';
import { CustomTextarea } from './CustomTextarea';
import { AFFIRMATION_TOPICS } from '../constants/affirmation';
import { PromptMode } from '../types/affirmation';

interface AffirmationFormProps {
  promptMode: PromptMode;
  selectedTopic: string;
  customPrompt: string;
  generationError: string | null;
  isGenerating: boolean;
  onTopicChange: (value: string) => void;
  onCustomPromptChange: (value: string) => void;
  onModeChange: (mode: PromptMode) => void;
  onRetry?: () => void;
}

export const AffirmationForm: React.FC<AffirmationFormProps> = ({
  promptMode,
  selectedTopic,
  customPrompt,
  generationError,
  isGenerating,
  onTopicChange,
  onCustomPromptChange,
  onModeChange,
  onRetry
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
    <>
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
            placeholder="Выбери тему"
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
            placeholder="Введи свою тему для аффирмации"
            label="Персональная тема"
            onChange={handleCustomPromptChange}
          />
        </div>
        
        {generationError && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '8px'
          }}>
            <Text style={{ 
              color: '#ff6b6b', 
              textAlign: 'center',
              fontSize: '14px',
              fontFamily: 'Jost'
            }}>
              Ошибка: {generationError}
            </Text>
            {onRetry && (
              <IconButton
                onClick={onRetry}
                disabled={isGenerating}
                style={{
                  backgroundColor: 'rgba(227, 199, 122, 0.1)',
                  border: '1px solid rgba(227, 199, 122, 0.3)',
                  borderRadius: '50%',
                  color: '#e3c77a',
                  transition: 'all 0.2s ease',
                  animation: isGenerating ? 'spin 1s linear infinite' : 'none'
                }}
              >
                <Icon24Refresh />
              </IconButton>
            )}
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};
