import { FC, useEffect, useState } from 'react';
import {
  Panel,
  Header,
  Div,
  NavIdProps,
  Text,
  Tabs,
  TabsItem,
  Group,
  Avatar,
  Button,
  ConfigProvider,
  Cell,
  Skeleton,
  Card,
  CardGrid,
  Title,
  Placeholder,
  Spinner,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchHoroscope, setType } from '../store/slices/horoscopeSlice';
import { fetchDecks } from '../store/slices/taroDecksSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { AppHeader } from '../components/AppHeader';

const horoscopeTypes = [
  { value: 'daily', label: 'На сегодня' },
  { value: 'weekly', label: 'На неделю' },
  { value: 'monthly', label: 'На месяц' },
];

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { type, horoscope, loading, error, sign, lang } = useAppSelector((state) => state.horoscope);
  const { decks, decksLoading, decksError } = useAppSelector((state) => state.taroDecks);
  const [horoscopeContentId] = useState('horoscope-content-panel');

  useEffect(() => {
    dispatch(fetchHoroscope({ sign, type, lang }));
  }, [dispatch, type, sign, lang]);

  useEffect(() => {
    dispatch(fetchDecks({ lang }));
  }, [dispatch, lang]);

  const handleTypeChange = (value: string) => {
    dispatch(setType(value as 'daily' | 'weekly' | 'monthly'));
  };

  const handleDeckDetails = (deckId: string) => {
    routeNavigator.push(`/deck/${deckId}`);
  };

  const handleOpenSpreads = () => {
    routeNavigator.push(`/spreads`);
  };

  const handleOpenAffirmations = () => {
    routeNavigator.push(`/affirmation`);
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
          right={
            <Button
              mode="tertiary"
              onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.SETTINGS}`)}
            >
              Настройки
            </Button>
          }
        />

        <Div style={{ padding: '0 12px' }}>
          <Group header={<Header size="s">Ваш гороскоп</Header>}>
            <Div style={{ padding: '12px 0' }}>
              <Tabs>
              {horoscopeTypes.map(({ value, label }) => (
                <TabsItem
                  key={value}
                  selected={type === value}
                  onClick={() => handleTypeChange(value)}
                  aria-controls={horoscopeContentId}
                >
                  {label}
                </TabsItem>
              ))}
              </Tabs>
            </Div>

            <div id={horoscopeContentId}>
              {loading && (
                <Div style={{ padding: '16px', marginBottom: '16px' }}>
                  <Skeleton width="100%" height={16} style={{ marginBottom: '12px' }} />
                  <Skeleton width="90%" height={16} style={{ marginBottom: '24px' }} />
                  
                  <Div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '0' }}>
                    <Skeleton width={100} height={24} />
                    <Skeleton width={100} height={24} />
                    <Skeleton width={100} height={24} />
                  </Div>
                </Div>
              )}
              
              {error && (
                <Div style={{ padding: '16px', marginBottom: '16px' }}>
                  <Text style={{ color: 'red' }}>{error}</Text>
                </Div>
              )}
              
              {horoscope && !loading && !error && (
                <Div style={{ 
                  padding: '16px', 
                  marginBottom: '16px'
                }}>
                  <Text style={{ 
                    marginBottom: '24px',
                    lineHeight: '1.5',
                    fontSize: '16px', 
                    textAlign: 'justify'
                  }}>{horoscope.prediction}</Text>
                  
                  <Div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    padding: '0'
                  }}>
                    <Div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <Text weight="2">Настроение:</Text>
                      <Text style={{ fontSize: '24px' }}>{horoscope.mood}</Text>
                    </Div>
                    <Div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <Text weight="2">Цвет дня:</Text>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: horoscope.color,
                        borderRadius: '4px'
                      }} />
                    </Div>
                    <Text>Счастливое число: {horoscope.number}</Text>
                  </Div>
                </Div>
              )}
            </div>
          </Group>

          <Group header={<Header size="s">Расклады Таро</Header>}>
            <Card mode="shadow">
              <Div style={{ padding: '16px' }}>
                <Title level="3" style={{ marginBottom: '8px' }}>Попробуйте гадание на картах Таро</Title>
                <Text style={{ marginBottom: '16px' }}>
                  Выберите один из доступных раскладов и получите предсказание на интересующий вас вопрос.
                </Text>
                <Button 
                  mode="primary" 
                  size="m" 
                  onClick={handleOpenSpreads}
                  stretched
                >
                  Выбрать расклад
                </Button>
              </Div>
            </Card>
          </Group>

          <Group header={<Header size="s">🌞 Ежедневные аффирмации</Header>}>
            <Card mode="shadow">
              <Div style={{ padding: '16px' }}>
                <Title level="3" style={{ marginBottom: '8px' }}>Аффирмации на сегодня</Title>
                <Text style={{ marginBottom: '16px' }}>
                  Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.
                </Text>
                <Button 
                  mode="primary" 
                  size="m" 
                  onClick={handleOpenAffirmations}
                  stretched
                >
                  Получить аффирмации
                </Button>
              </Div>
            </Card>
          </Group>

          <Group header={<Header size="s">Ваши колоды</Header>}>
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
      </Panel>
    </ConfigProvider>
  );
};
