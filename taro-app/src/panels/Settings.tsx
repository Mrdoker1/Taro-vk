import { FC } from 'react';
import {
  Panel,
  Header,
  Div,
  NavIdProps,
  Select,
  Group,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { setSign } from '../store/slices/horoscopeSlice';
import { AppHeader } from '../components/AppHeader';

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

export interface SettingsProps extends NavIdProps {}

export const Settings: FC<SettingsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { sign } = useAppSelector((state) => state.horoscope);

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSign(e.target.value as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces'));
  };

  return (
    <Panel id={id}>
      <AppHeader
        left={
          <Button
            mode="tertiary"
            onClick={() => routeNavigator.back()}
          >
            Назад
          </Button>
        }
      />

      <Div style={{ padding: '0 12px' }}>
        <Group header={<Header size="s">Ваш знак зодиака</Header>}>
          <Div>
            <Select
              value={sign}
              onChange={handleSignChange}
              options={zodiacSigns}
              placeholder="Выберите знак зодиака"
            />
          </Div>
        </Group>
      </Div>
    </Panel>
  );
}; 