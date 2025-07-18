import { FC } from 'react';
import {
  Panel,
  Header,
  Div,
  NavIdProps,
  Select,
  Group,
  Button,
  FormItem,
  Switch,
  Popover,
  IconButton,
} from '@vkontakte/vkui';
import { Icon20QuestionOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { setSign, setLanguage } from '../store/slices/horoscopeSlice';
import { setUseManualCardSelection } from '../store/slices/appSlice';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { AppLanguage, getLanguageDisplayName } from '../utils/languageUtils';

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

// Доступные в настоящее время языки
const availableLanguages: AppLanguage[] = ['russian', 'english'];

// Создаем список языков для дропдауна
const languages = availableLanguages.map(lang => ({
  value: lang,
  label: getLanguageDisplayName(lang)
}));

export interface SettingsProps extends NavIdProps {}

export const Settings: FC<SettingsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { sign, lang } = useAppSelector((state) => state.horoscope);
  const { useManualCardSelection } = useAppSelector((state) => state.app);

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSign(e.target.value as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces'));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLanguage(e.target.value as AppLanguage));
  };

  const handleManualCardSelectionChange = () => {
    dispatch(setUseManualCardSelection(!useManualCardSelection));
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
            onClick={() => routeNavigator.back()}
          >
            Назад
          </Button>
        }
        right={<StarButton size="s" />}
      />

      <Div style={{ padding: '0 12px' }}>
        <Group header={<Header size="s">Настройки</Header>}>
          <FormItem top="Знак зодиака">
            <Select
              value={sign}
              onChange={handleSignChange}
              options={zodiacSigns}
              placeholder="Выберите знак зодиака"
            />
          </FormItem>
          
          <FormItem top="Язык запросов">
            <Select
              value={lang}
              onChange={handleLanguageChange}
              options={languages}
              placeholder="Выберите язык"
            />
          </FormItem>
          
          <FormItem>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontWeight: 'medium' }}>
                  Выбирать карты из списка самому
                </div>
                <Popover
                  content={
                    <Div style={{ maxWidth: '250px', padding: '8px' }}>
                      <div style={{ fontSize: '14px' }}>
                        Включает режим ручного выбора карт вместо перетаскивания
                      </div>
                    </Div>
                  }
                >
                  <IconButton
                    hasActive={false}
                    aria-label="Показать справку о настройке выбора карт"
                  >
                    <Icon20QuestionOutline fill="var(--vkui--color_icon_accent)" />
                  </IconButton>
                </Popover>
              </div>
              <Switch
                checked={useManualCardSelection}
                onChange={handleManualCardSelectionChange}
              />
            </div>
          </FormItem>
        </Group>
      </Div>

      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
}; 