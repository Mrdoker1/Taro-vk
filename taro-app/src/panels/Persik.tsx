import { FC } from 'react';
import { NavIdProps, Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui';
import { useSafeNavigation } from '../utils/routerNavigation';
import PersikImage from '../assets/persik.png';

export const Persik: FC<NavIdProps> = ({ id }) => {
  const { safeBack } = useSafeNavigation();

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => safeBack()} />}>
        Persik
      </PanelHeader>
      <Placeholder>
        <img width={230} src={PersikImage} alt="Persik The Cat" />
      </Placeholder>
    </Panel>
  );
};
