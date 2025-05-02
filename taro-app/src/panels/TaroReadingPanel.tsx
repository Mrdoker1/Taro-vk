import { FC, useState } from 'react';
import {
  Panel,
  NavIdProps,
  PanelHeader,
  PanelHeaderBack,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { CardSelector } from '../components/CardSelector';
import { TaroReading } from '../components/TaroReading';

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

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBack} />}
      >
        {currentStep === 'SELECT_CARDS' ? 'Выбор карт' : 'Толкование расклада'}
      </PanelHeader>

      {currentStep === 'SELECT_CARDS' && (
        <CardSelector
          spreadId={spreadId}
          deckId={deckId}
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
    </Panel>
  );
};

export default TaroReadingPanel; 