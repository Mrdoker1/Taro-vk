import { FC } from 'react';
import { Panel, NavIdProps, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Calendar } from '../components/Calendar';

export interface CalendarPanelProps extends NavIdProps {}

export const CalendarPanel: FC<CalendarPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    routeNavigator.back();
  };

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBackClick} />}
      >
        Календарь активностей
      </PanelHeader>
      <Calendar />
    </Panel>
  );
}; 