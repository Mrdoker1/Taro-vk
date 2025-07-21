import { FC, useEffect, useState } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  Avatar,
  Button,
  ConfigProvider,
  Cell,
} from '@vkontakte/vkui';
import { 
  Icon28Cards2Outline,
  Icon28MessageOutline,
  Icon28CalendarOutline,
  Icon28SettingsOutline,
} from '@vkontakte/icons';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';

import { fetchDecks } from '../store/slices/taroDecksSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { HoroscopeSection } from '../components/HoroscopeSection';
import { ExploreSection } from '../components/ExploreSection';
import { DecksDisplaySection } from '../components/DecksDisplaySection';

import { BannerStars } from '../components/BannerStars';



export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.horoscope);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchDecks({ lang }));
  }, [dispatch, lang]);

  const isMobile = windowWidth < 768;



  const handleDeckDetails = (deckId: string) => {
    routeNavigator.push(`/deck/${deckId}`);
  };

  const handleOpenSpreads = () => {
    routeNavigator.push(`/spreads`);
  };

  const handleOpenAffirmations = () => {
    routeNavigator.push(`/affirmation`);
  };

  const handleOpenCalendar = () => {
    routeNavigator.push(`/calendar`);
  };

  const handleOpenSettings = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.SETTINGS}`);
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
            <Cell
              before={<Avatar size={36} src={photo_200} />}
            >
              {first_name}
            </Cell>
          }
          center={
            <>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenSpreads}
                before={isMobile ? <Icon28Cards2Outline width={16} height={16} /> : undefined}
                style={{ color: '#ffffff' }}
              >
                Расклады
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenAffirmations}
                before={isMobile ? <Icon28MessageOutline width={16} height={16} /> : undefined}
                style={{ color: '#ffffff' }}
              >
                Аффирмации
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenCalendar}
                before={isMobile ? <Icon28CalendarOutline width={16} height={16} /> : undefined}
                style={{ color: '#ffffff' }}
              >
                Календарь
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenSettings}
                before={isMobile ? <Icon28SettingsOutline width={16} height={16} /> : undefined}
                style={{ color: '#ffffff' }}
              >
                Настройки
              </Button>
            </>
          }
          right={<StarButton size="s" />}
        />

        <Div style={{ padding: '0 12px' }}>
          <HoroscopeSection />

          <div style={{ marginTop: '12px' }}>
            <ExploreSection 
              onOpenSpreads={handleOpenSpreads}
              onOpenAffirmations={handleOpenAffirmations}
              onOpenCalendar={handleOpenCalendar}
            />
          </div>

          {/* Баннер получения звезд */}
          <div style={{ marginTop: '12px' }}>
            <BannerStars 
              onLearnMore={() => {
                // TODO: Реализовать страницу с подробной информацией о звездах
                console.log('Узнать больше о звездах');
              }}
            />
          </div>

          {/* Секция с колодами */}
          <DecksDisplaySection onViewDeckDetails={handleDeckDetails} />
        </Div>
        
        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
};
