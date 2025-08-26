import { FC } from 'react';
import { Panel, PanelHeader, Button } from '@vkontakte/vkui';
import { NavIdProps } from '@vkontakte/vkui';
import { useSafeNavigation } from '../utils/routerNavigation';

export interface NewPageProps extends NavIdProps {}

export const NewPage: FC<NewPageProps> = ({ id }) => {
  const { safeBack } = useSafeNavigation();

  return (
    <Panel id={id}>
      <PanelHeader
        before={
          <Button
            mode="tertiary"
            onClick={() => safeBack()}
            style={{ 
              marginLeft: '12px',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
            }}
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