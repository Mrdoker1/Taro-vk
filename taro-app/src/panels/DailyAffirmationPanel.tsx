import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  PanelHeader,
  PanelHeaderBack
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { DailyAffirmation } from '../components/DailyAffirmation';

export interface DailyAffirmationPanelProps extends NavIdProps {
  // Можно добавить дополнительные параметры при необходимости
}

export const DailyAffirmationPanel: FC<DailyAffirmationPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    routeNavigator.back();
  };

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBackClick} />}
      >
        Ежедневные аффирмации
      </PanelHeader>
      
      <DailyAffirmation />
    </Panel>
  );
};

export default DailyAffirmationPanel; 