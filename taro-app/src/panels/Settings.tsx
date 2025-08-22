import { FC } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  ConfigProvider,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { setSign, setLanguage } from '../store/slices/horoscopeSlice';
import { setUseManualCardSelection, setTheme } from '../store/slices/appSlice';
import { clearCurrentTemplate } from '../store/slices/promptSlice';
import { AppHeader } from '../components/AppHeader';
import settingsIcon from '../assets/settings.svg';
import { Footer } from '../components/Footer';
import { CustomSelect } from '../components/CustomSelect';
import { CustomToggle } from '../components/CustomToggle';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { AppLanguage, getLanguageDisplayName } from '../utils/languageUtils';
import { BACKGROUND_BASE } from '../constants/styles';
import { getThemeOptions, ThemeKey } from '../constants/themes';

type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

const zodiacSigns = [
  { value: 'Aries' as ZodiacSign, label: 'Овен' },
  { value: 'Taurus' as ZodiacSign, label: 'Телец' },
  { value: 'Gemini' as ZodiacSign, label: 'Близнецы' },
  { value: 'Cancer' as ZodiacSign, label: 'Рак' },
  { value: 'Leo' as ZodiacSign, label: 'Лев' },
  { value: 'Virgo' as ZodiacSign, label: 'Дева' },
  { value: 'Libra' as ZodiacSign, label: 'Весы' },
  { value: 'Scorpio' as ZodiacSign, label: 'Скорпион' },
  { value: 'Sagittarius' as ZodiacSign, label: 'Стрелец' },
  { value: 'Capricorn' as ZodiacSign, label: 'Козерог' },
  { value: 'Aquarius' as ZodiacSign, label: 'Водолей' },
  { value: 'Pisces' as ZodiacSign, label: 'Рыбы' },
];

// Доступные в настоящее время языки
const availableLanguages: AppLanguage[] = ['russian', 'english'];

// Создаем список языков для дропдауна
const languages = availableLanguages.map(lang => ({
  value: lang,
  label: getLanguageDisplayName(lang)
}));

// Создаем список тем для дропдауна
const themes = getThemeOptions();

export interface SettingsProps extends NavIdProps {}

export const Settings: FC<SettingsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { sign, lang } = useAppSelector((state) => state.horoscope);
  const { useManualCardSelection, theme } = useAppSelector((state) => state.app);

  const handleZodiacChange = (value: string) => {
    dispatch(setSign(value as ZodiacSign));
  };

  const handleLanguageChange = (value: string) => {
    // Очищаем текущий промпт при смене языка, чтобы загрузился новый
    dispatch(clearCurrentTemplate());
    dispatch(setLanguage(value as AppLanguage));
  };

  const handleManualCardSelectionChange = (checked: boolean) => {
    dispatch(setUseManualCardSelection(checked));
  };

  const handleThemeChange = (value: string) => {
    dispatch(setTheme(value as ThemeKey));
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
              onClick={() => routeNavigator.back()}
            >
              Назад
            </Button>
          }
        />

        <Div style={{ 
          padding: '20px 12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            ...BACKGROUND_BASE,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            padding: '32px'
          }}>
            {/* Заголовок секции */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}>
                <img
                  src={settingsIcon}
                  alt="Settings icon"
                  style={{
                    width: '44px',
                    height: '44px',
                    objectFit: 'contain'
                  }}
                />
              <h1 style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '400',
                margin: 0,
                fontFamily: 'Jost',
                lineHeight: 1.2,
                flex: 1,
                minWidth: 0
              }}>
                Настройки
              </h1>
            </div>

            {/* Декоративный элемент */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <img
                src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a73aa4a82442cd6022e0ae5e650a0c240ffa4f01"
                alt="Decorative element"
                style={{
                  width: '90px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Разделитель */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'rgba(232, 210, 140, 0.15)',
              marginBottom: '32px'
            }} />

            {/* Форма настроек */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '280px',
              margin: '0 auto'
            }}>
              <CustomSelect
                value={sign}
                options={zodiacSigns}
                label="Знак зодиака"
                placeholder="Выберите знак"
                onChange={handleZodiacChange}
              />

              <CustomSelect
                value={lang}
                options={languages}
                label="Язык запросов"
                placeholder="Выберите язык"
                onChange={handleLanguageChange}
              />

              <CustomSelect
                value={theme}
                options={themes}
                label="Тема оформления"
                placeholder="Выберите тему"
                onChange={handleThemeChange}
              />

              <CustomToggle
                checked={useManualCardSelection}
                onChange={handleManualCardSelectionChange}
                label="Выбирать карты из списка самому"
                tooltip="Когда включено, вы сможете выбирать карты из списка вместо использования drag-and-drop"
              />
            </div>

            {/* Нижний разделитель */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'rgba(232, 210, 140, 0.15)',
              marginTop: '32px',
              marginBottom: '16px'
            }} />

            {/* Нижний декоративный элемент */}
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img
                src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/154f96a15bcd974fd38495f6f7aeec22f8b9613a"
                alt="Decorative element"
                style={{
                  width: '90px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
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
