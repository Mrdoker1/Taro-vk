import { FC } from 'react';
import { Panel, PanelHeader, Button } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { NavIdProps } from '@vkontakte/vkui';

export interface NewPageProps extends NavIdProps {}

export const NewPage: FC<NewPageProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  return (
    <Panel id={id}>
      <PanelHeader
        before={
          <Button
            mode="tertiary"
            onClick={() => routeNavigator.back()}
            style={{ marginLeft: '12px' }}
          >
            Назад
          </Button>
        }
      >
        Новая страница
      </PanelHeader>
    </Panel>
  );
}; 