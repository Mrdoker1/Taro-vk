import { FC, useState } from 'react';
import {
  Panel,
  NavIdProps,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppSelector } from '../store';
import { CardSelector } from '../components/CardSelector';
import { TaroReading } from '../components/TaroReading';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
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
  const [currentStep, setCurrentStep] = useState<ReadingStep>('SELECT_CARDS');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  
  // Получаем вопрос из глобального store
  const { userQuestion } = useAppSelector((state) => state.app);

  const handleBack = () => {
    if (currentStep === 'VIEW_READING') {
      setCurrentStep('SELECT_CARDS');
    } else {
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
          >
            {currentStep === 'VIEW_READING' ? 'К выбору карт' : 'Назад'}
          </Button>
        }
        right={<StarButton size="s" />}
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