import { FC, useEffect } from 'react';
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
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchHoroscope, setType } from '../store/slices/horoscopeSlice';
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

  useEffect(() => {
    dispatch(fetchHoroscope({ sign, type, lang }));
  }, [dispatch, type, sign, lang]);

  const handleTypeChange = (value: string) => {
    dispatch(setType(value as 'daily' | 'weekly' | 'monthly'));
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
                >
                  {label}
                </TabsItem>
              ))}
              </Tabs>
            </Div>

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
          </Group>
        </Div>
      </Panel>
    </ConfigProvider>
  );
};
