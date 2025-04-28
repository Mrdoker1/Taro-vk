import { FC, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Cell,
  Div,
  Avatar,
  NavIdProps,
  Select,
  Spinner,
  Text,
  Tabs,
  TabsItem,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchHoroscope, setSign, setType } from '../store/slices/horoscopeSlice';

const zodiacSigns = [
  { value: 'Aries', label: 'Овен' },
  { value: 'Taurus', label: 'Телец' },
  { value: 'Gemini', label: 'Близнецы' },
  { value: 'Cancer', label: 'Рак' },
  { value: 'Leo', label: 'Лев' },
  { value: 'Virgo', label: 'Дева' },
  { value: 'Libra', label: 'Весы' },
  { value: 'Scorpio', label: 'Скорпион' },
  { value: 'Sagittarius', label: 'Стрелец' },
  { value: 'Capricorn', label: 'Козерог' },
  { value: 'Aquarius', label: 'Водолей' },
  { value: 'Pisces', label: 'Рыбы' },
];

const horoscopeTypes = [
  { value: 'daily', label: 'На сегодня' },
  { value: 'weekly', label: 'На неделю' },
  { value: 'monthly', label: 'На месяц' },
];

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  
  const dispatch = useAppDispatch();
  const { sign, type, dailyHoroscope, loading, error } = useAppSelector((state) => state.horoscope);

  useEffect(() => {
    dispatch(fetchHoroscope({ sign, type }));
  }, [dispatch, sign, type]);

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSign(e.target.value));
  };

  const handleTypeChange = (value: string) => {
    dispatch(setType(value as 'daily' | 'weekly' | 'monthly'));
  };

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>
      {fetchedUser && (
        <Group header={<Header size="s">User Data Fetched with VK Bridge</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Гороскоп</Header>}>
        <Div>
          <Select
            value={sign}
            onChange={handleSignChange}
            options={zodiacSigns}
            placeholder="Выберите знак зодиака"
          />
        </Div>

        <Div>
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
          <Div>
            <Spinner size="m" />
          </Div>
        )}
        
        {error && (
          <Div>
            <Text style={{ color: 'red' }}>{error}</Text>
          </Div>
        )}
        
        {dailyHoroscope && !loading && !error && (
          <Div>
            <Text style={{ marginBottom: 4 }}>Дата: {dailyHoroscope.date}</Text>
            <Text weight="2" style={{ marginBottom: 8 }}>{dailyHoroscope.horoscope}</Text>
          </Div>
        )}
      </Group>

      <Group header={<Header size="s">Navigation Example</Header>}>
        <Div>
          <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('persik')}>
            Покажите Персика, пожалуйста!
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};
