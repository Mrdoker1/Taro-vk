import { FC, useState } from 'react';
import {
  Panel,
  NavIdProps,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppSelector, useAppDispatch } from '../store';
import { clearUserQuestion } from '../store/slices/appSlice';
import { CardSelector } from '../components/CardSelector';
import { TaroReading } from '../components/TaroReading';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';
import { DEFAULT_VIEW_PANELS } from '../routes';

export interface TaroReadingPanelProps extends NavIdProps {
  spreadId: string;
  deckId: string;
}

type ReadingStep = 'SELECT_CARDS' | 'VIEW_READING';

export interface SelectedCard {
  position: number;
  cardId: string;
  isReversed: boolean;
}

export const TaroReadingPanel: FC<TaroReadingPanelProps> = ({ id, spreadId, deckId }) => {
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState<ReadingStep>('SELECT_CARDS');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  
  // Получаем вопрос из глобального store
  const { userQuestion } = useAppSelector((state) => state.app);

  const handleBack = () => {
    if (currentStep === 'VIEW_READING') {
      setCurrentStep('SELECT_CARDS');
    } else {
      // Очищаем вопрос при выходе из гадания
      dispatch(clearUserQuestion());
      routeNavigator.back();
    }
  };

  const handleCardsSelected = (cards: SelectedCard[]) => {
    setSelectedCards(cards);
    setCurrentStep('VIEW_READING');
  };

  const handleAboutApp = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  };

  const handleLegalInfo = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  };

  return (
    <Panel id={id}>
      <AppHeader
        left={
          <Button
            mode="tertiary"
            onClick={handleBack}
            style={{ 
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
            }}
          >
            {currentStep === 'VIEW_READING' ? 'К выбору карт' : 'Назад'}
          </Button>
        }
      />

      {currentStep === 'SELECT_CARDS' && (
        <CardSelector
          spreadId={spreadId}
          deckId={deckId}
          userQuestion={userQuestion}
          onCardsSelected={handleCardsSelected}
          onBack={handleBack}
        />
      )}

      {currentStep === 'VIEW_READING' && (
        <TaroReading
          spreadId={spreadId}
          deckId={deckId}
          selectedCards={selectedCards}
          userQuestion={userQuestion} // Передаем вопрос из глобального store
          onBack={() => setCurrentStep('SELECT_CARDS')}
        />
      )}
      
      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
};

export default TaroReadingPanel; 