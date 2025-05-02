import { FC, useState } from 'react';
import {
  Panel,
  NavIdProps,
  PanelHeader,
  PanelHeaderBack,
  Group,
  Div,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { TaroSpreads as TaroSpreadsComponent } from '../components/TaroSpreads';
import { TaroSpreadDetails } from '../components/TaroSpreadDetails';

export interface TaroSpreadsProps extends NavIdProps {}

export const TaroSpreads: FC<TaroSpreadsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const [selectedSpreadId, setSelectedSpreadId] = useState<string | null>(null);

  const handleSelectSpread = (spreadId: string) => {
    setSelectedSpreadId(spreadId);
  };

  const handleBack = () => {
    if (selectedSpreadId) {
      setSelectedSpreadId(null);
    } else {
      routeNavigator.back();
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBack} />}
      >
        {selectedSpreadId ? 'Детали расклада' : 'Расклады Таро'}
      </PanelHeader>

      <Group>
        <Div>
          {selectedSpreadId ? (
            <TaroSpreadDetails 
              spreadId={selectedSpreadId} 
              onBack={handleBack}
            />
          ) : (
            <TaroSpreadsComponent onSelectSpread={handleSelectSpread} />
          )}
        </Div>
      </Group>
    </Panel>
  );
};

export default TaroSpreads; 