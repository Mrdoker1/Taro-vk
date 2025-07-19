import { FC, useEffect } from 'react';
import {
  Panel,
  Header,
  Div,
  NavIdProps,
  Text,
  Group,
  Avatar,
  Button,
  ConfigProvider,
  Cell,
  Card,
  CardGrid,
  Title,
  Placeholder,
  Spinner,
} from '@vkontakte/vkui';
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

import { BannerStars } from '../components/BannerStars';



export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { decks, decksLoading, decksError } = useAppSelector((state) => state.taroDecks);
  const { lang } = useAppSelector((state) => state.horoscope);

  useEffect(() => {
    dispatch(fetchDecks({ lang }));
  }, [dispatch, lang]);



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
              >
                Расклады
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenAffirmations}
              >
                Аффирмации
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenCalendar}
              >
                Календарь
              </Button>
              <Button
                mode="tertiary"
                size="s"
                onClick={handleOpenSettings}
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

          <Group header={
            <Header size="s">
              Твои колоды {!decksLoading && !decksError && decks.length > 0 && `(${decks.length})`}
            </Header>
          }>
            {decksLoading && (
              <Div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <Spinner size="m" />
              </Div>
            )}
            
            {decksError && (
              <Placeholder>
                <Text style={{ color: 'red' }}>{decksError}</Text>
              </Placeholder>
            )}
            
            {!decksLoading && !decksError && decks.length === 0 && (
              <Placeholder>
                Колоды не найдены
              </Placeholder>
            )}
            
            {!decksLoading && !decksError && decks.length > 0 && (
              <CardGrid size="l">
                {decks.map(deck => (
                  <Card key={deck.id} mode="shadow">
                    <Div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {deck.coverImageUrl && (
                          <img 
                            src={deck.coverImageUrl} 
                            alt={deck.name} 
                            style={{ 
                              width: '60px', 
                              height: '90px', 
                              objectFit: 'cover', 
                              borderRadius: '8px' 
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <Title level="3" style={{ marginBottom: '8px' }}>{deck.name}</Title>
                          <Text style={{ marginBottom: '8px' }}>{deck.description}</Text>
                          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                            Карт: {deck.cardsCount}
                          </Text>
                        </div>
                      </div>
                      <Div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0 0 0' }}>
                        <Button 
                          mode="primary" 
                          size="m" 
                          disabled={!deck.available}
                          onClick={() => handleDeckDetails(deck.id)}
                        >
                          Подробнее
                        </Button>
                      </Div>
                    </Div>
                  </Card>
                ))}
              </CardGrid>
            )}
          </Group>
        </Div>
        
        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
};
