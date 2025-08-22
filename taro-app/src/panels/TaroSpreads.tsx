import { FC, useState, useEffect } from 'react';
import {
  Panel,
  NavIdProps,
  Div,
  Button,
  ConfigProvider,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSpreads } from '../store/slices/taroSpreadsSlice';
import { SpreadsDisplaySection } from '../components/SpreadsDisplaySection';
import { TaroSpreadDetails } from '../components/TaroSpreadDetails';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';
import { DEFAULT_VIEW_PANELS } from '../routes';

export interface TaroSpreadsProps extends NavIdProps {}

export const TaroSpreads: FC<TaroSpreadsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.horoscope);
  const [selectedSpreadId, setSelectedSpreadId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSpreads({ lang }));
  }, [dispatch, lang]);

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
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={
            <Button
              mode="tertiary"
              onClick={handleBack}
              style={{ 
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              {selectedSpreadId ? 'К раскладам' : 'Назад'}
            </Button>
          }
        />

        <Div style={{ 
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {selectedSpreadId ? (
            <TaroSpreadDetails 
              spreadId={selectedSpreadId} 
              onBack={handleBack}
            />
          ) : (
            <SpreadsDisplaySection onSelectSpread={handleSelectSpread} />
          )}
        </Div>

        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
};

export default TaroSpreads; 