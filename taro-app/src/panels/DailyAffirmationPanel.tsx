import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  PanelHeader,
  PanelHeaderBack
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { DailyAffirmation } from '../components/DailyAffirmation';
import { Footer } from '../components/Footer';
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
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBackClick} />}
      >
        Ежедневные аффирмации
      </PanelHeader>
      
      <DailyAffirmation />
      
      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
};

export default DailyAffirmationPanel; 