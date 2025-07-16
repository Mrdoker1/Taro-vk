import { FC, useState } from 'react';
import {
  Panel,
  NavIdProps,
  Group,
  Div,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { TaroSpreads as TaroSpreadsComponent } from '../components/TaroSpreads';
import { TaroSpreadDetails } from '../components/TaroSpreadDetails';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';
import { DEFAULT_VIEW_PANELS } from '../routes';

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
            onClick={handleBack}
          >
            {selectedSpreadId ? 'К раскладам' : 'Назад'}
          </Button>
        }
        right={<StarButton size="s" mode="primary" />}
      />

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

      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
};

export default TaroSpreads; 