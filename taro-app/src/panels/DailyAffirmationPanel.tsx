import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  Button
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { DailyAffirmation } from '../components/DailyAffirmation';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';
import { DEFAULT_VIEW_PANELS } from '../routes';

export interface DailyAffirmationPanelProps extends NavIdProps {
  // Можно добавить дополнительные параметры при необходимости
}

export const DailyAffirmationPanel: FC<DailyAffirmationPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    routeNavigator.back();
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
            onClick={handleBackClick}
          >
            Назад
          </Button>
        }
        right={<StarButton size="s" mode="primary" />}
      />
      
      <DailyAffirmation />
      
      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
};

export default DailyAffirmationPanel; 