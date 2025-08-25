// Типы для ежедневных аффирмаций

export interface AffirmationTopic {
  value: string;
  label: string;
}

export interface ParsedAffirmation {
  title: string;
  sections: {
    title: string;
    text: string;
  }[];
  usage: string;
  error?: boolean;
  message?: string;
  generatedTopic?: string; // Тема, использованная для генерации этой аффирмации
}

export type PromptMode = 'preset' | 'custom';

export interface AffirmationState {
  customPrompt: string;
  selectedTopic: string;
  promptMode: PromptMode;
  isGenerating: boolean;
  handleGenerate: () => void;
}

declare global {
  interface Window {
    affirmationState?: AffirmationState;
  }
}
