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

          <Group header={<Header size="s">🔮 Исследуй Таро</Header>}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexDirection: 'row',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              {/* Расклады Таро */}
              <Card mode="shadow" style={{ flex: '1', minWidth: '200px' }}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🃏</span>
                    <Title level="3" style={{ margin: 0, fontSize: '16px' }}>Расклады Таро</Title>
                  </div>
                  <Text style={{ marginBottom: '16px', fontSize: '13px', lineHeight: '1.3' }}>
                    Выберите один из доступных раскладов и получите предсказание на интересующий вас вопрос.
                  </Text>
                  <Button 
                    mode="primary" 
                    size="s" 
                    onClick={handleOpenSpreads}
                    stretched
                  >
                    Выбрать расклад
                  </Button>
                </Div>
              </Card>

              {/* Ежедневные аффирмации */}
              <Card mode="shadow" style={{ flex: '1', minWidth: '200px' }}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🌞</span>
                    <Title level="3" style={{ margin: 0, fontSize: '16px' }}>Аффирмации</Title>
                  </div>
                  <Text style={{ marginBottom: '16px', fontSize: '13px', lineHeight: '1.3' }}>
                    Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.
                  </Text>
                  <Button 
                    mode="primary" 
                    size="s" 
                    onClick={handleOpenAffirmations}
                    stretched
                  >
                    Получить аффирмации
                  </Button>
                </Div>
              </Card>

              {/* Календарь активностей */}
              <Card mode="shadow" style={{ flex: '1', minWidth: '200px' }}>
                <Div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📅</span>
                    <Title level="3" style={{ margin: 0, fontSize: '16px' }}>Духовный дневник</Title>
                  </div>
                  <Text style={{ marginBottom: '16px', fontSize: '13px', lineHeight: '1.3' }}>
                    Отслеживайте свои расклады Таро, аффирмации и ведите заметки о своем духовном развитии.
                  </Text>
                  <Button 
                    mode="primary" 
                    size="s" 
                    onClick={handleOpenCalendar}
                    stretched
                  >
                    Открыть календарь
                  </Button>
                </Div>
              </Card>
            </div>
          </Group>

          {/* Баннер получения звезд */}
          <Group>
            <Card 
              mode="shadow" 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                overflow: 'hidden'
              }}
            >
              <Div style={{ padding: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}>
                  {/* Левая часть с контентом */}
                  <div style={{ flex: '1', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span>
                      <Title 
                        level="2" 
                        style={{ 
                          color: 'white', 
                          margin: 0,
                          fontWeight: '600'
                        }}
                      >
                        Получай звезды
                      </Title>
                    </div>
                    
                    <Text 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        marginBottom: '16px',
                        lineHeight: '1.4',
                        fontSize: '15px'
                      }}
                    >
                      Зарабатывай звезды за активность и трать их на уникальные расклады, 
                      коллекционные пины и магические артефакты.
                    </Text>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ffd700', fontSize: '16px' }}>•</span>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>
                          Проводи расклад дня +1 звезда
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ffd700', fontSize: '16px' }}>•</span>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>
                          Напиши в дневник +1 звезда
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  {/* Правая часть с кнопкой */}
                  <div style={{ flex: '0 0 auto' }}>
                    <Button
                      mode="outline"
                      size="m"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        // TODO: Реализовать страницу с подробной информацией о звездах
                        console.log('Узнать больше о звездах');
                      }}
                    >
                      Узнать больше
                    </Button>
                  </div>
                </div>
              </Div>
            </Card>
          </Group>

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
