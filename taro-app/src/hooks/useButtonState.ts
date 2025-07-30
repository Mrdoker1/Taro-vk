import { useState, useEffect } from 'react';

// Хук для отслеживания состояния кнопки генерации
export const useButtonState = () => {
  const [isGenerateDisabled, setIsGenerateDisabled] = useState(true);

  useEffect(() => {
    const checkButtonState = () => {
      if (window.affirmationState) {
        const { selectedTopic, customPrompt, promptMode } = window.affirmationState;
        const hasPresetTopic = promptMode === 'preset' && selectedTopic && selectedTopic !== '';
        const hasCustomPrompt = promptMode === 'custom' && customPrompt && customPrompt.trim() !== '';
        setIsGenerateDisabled(!(hasPresetTopic || hasCustomPrompt));
      } else {
        setIsGenerateDisabled(true);
      }
    };

    const interval = setInterval(checkButtonState, 200);
    checkButtonState();

    return () => clearInterval(interval);
  }, []);

  return isGenerateDisabled;
};
