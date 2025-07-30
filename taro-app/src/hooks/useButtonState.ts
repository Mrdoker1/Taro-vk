// Простая функция для проверки состояния кнопки
export const getButtonState = () => {
  if (!window.affirmationState) return true;
  
  const { selectedTopic, customPrompt, promptMode } = window.affirmationState;
  const hasPresetTopic = promptMode === 'preset' && selectedTopic && selectedTopic !== '';
  const hasCustomPrompt = promptMode === 'custom' && customPrompt && customPrompt.trim() !== '';
  
  return !(hasPresetTopic || hasCustomPrompt);
};
