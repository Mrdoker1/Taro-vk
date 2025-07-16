import { FC } from 'react';
import { Panel, NavIdProps, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Calendar } from '../components/Calendar';
import { Footer } from '../components/Footer';
import { DEFAULT_VIEW_PANELS } from '../routes';

export interface CalendarPanelProps extends NavIdProps {}

export const CalendarPanel: FC<CalendarPanelProps> = ({ id }) => {
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
        Календарь активностей
      </PanelHeader>
      <Calendar />
      
      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
}; 