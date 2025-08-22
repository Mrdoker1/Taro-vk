import { FC, useEffect, useState, useRef, useCallback } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  Avatar,
  Button,
  ConfigProvider,
} from '@vkontakte/vkui';
import { 
  Icon28Cards2Outline,
  Icon28MessageOutline,
  Icon28CalendarOutline,
} from '@vkontakte/icons';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';

import { fetchDecks } from '../store/slices/taroDecksSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';
import { HoroscopeSection } from '../components/HoroscopeSection';
import { ExploreSection } from '../components/ExploreSection';
import { DecksDisplaySection } from '../components/DecksDisplaySection';



export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.horoscope);
  const { decksLoading } = useAppSelector((state) => state.taroDecks);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Простая мемоизация - запоминаем последний язык для которого загружали данные
  const lastFetchedLang = useRef<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Простая проверка - запрашиваем данные только если:
    // 1. Еще не загружается
    // 2. Язык изменился (или это первая загрузка)
    if (!decksLoading && lastFetchedLang.current !== lang) {
      dispatch(fetchDecks({ lang }));
      lastFetchedLang.current = lang;
    }
  }, [dispatch, lang, decksLoading]);

  const isMobile = windowWidth < 768;



  const handleDeckDetails = useCallback((deckId: string) => {
    routeNavigator.push(`/deck/${deckId}`);
  }, [routeNavigator]);

  const handleOpenSpreads = useCallback(() => {
    routeNavigator.push(`/spreads`);
  }, [routeNavigator]);

  const handleOpenAffirmations = useCallback(() => {
    routeNavigator.push(`/affirmation`);
  }, [routeNavigator]);

  const handleOpenCalendar = () => {
    routeNavigator.push(`/calendar`);
  };

  const handleOpenSettings = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.SETTINGS}`);
  };

  const handleOpenProfile = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.PROFILE}`);
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: 0,
              cursor: 'pointer'
            }}
            onClick={handleOpenProfile}
            >
              <Avatar size={36} src={photo_200} />
              <span style={{ color: 'white', fontWeight: 500 }}>{first_name}</span>
            </div>
          }
          center={
            <>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenSpreads}
                before={isMobile ? <Icon28Cards2Outline width={16} height={16} /> : undefined}
                style={{ 
                  color: '#ffffff',
                  transition: 'background-color 0.2s ease',
                }}
              >
                Расклады
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenAffirmations}
                before={isMobile ? <Icon28MessageOutline width={16} height={16} /> : undefined}
                style={{ 
                  color: '#ffffff',
                  transition: 'background-color 0.2s ease',
                }}
              >
                Аффирмации
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenCalendar}
                before={isMobile ? <Icon28CalendarOutline width={16} height={16} /> : undefined}
                style={{ 
                  color: '#ffffff',
                  transition: 'background-color 0.2s ease',
                }}
              >
                Календарь
              </Button>
            </>
          }
          right={
            <Button
              mode="tertiary"
              size="s"
              onClick={handleOpenSettings}
              style={{ 
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              Настройки
            </Button>
          }
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

          {/* Баннер получения звезд - временно скрыт */}
          {/* 
          <div style={{ marginTop: '12px' }}>
            <BannerStars />
          </div>
          */}

          {/* Секция с колодами */}
          <div style={{ marginBottom: '20px' }}>
            <DecksDisplaySection onViewDeckDetails={handleDeckDetails} />
          </div>
        </Div>
        
        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
};
