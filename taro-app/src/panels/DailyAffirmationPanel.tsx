import { FC } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  ConfigProvider,
  Button
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { DailyAffirmation } from '../components/DailyAffirmation';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';
import { useResponsive } from '../hooks/useResponsive';
import { DEFAULT_VIEW_PANELS } from '../routes';
import affirmationIcon from '../assets/afirmation.svg';

export interface DailyAffirmationPanelProps extends NavIdProps {}

export const DailyAffirmationPanel: FC<DailyAffirmationPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();

  const handleBackClick = () => routeNavigator.back();
  const handleAboutApp = () => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  const handleLegalInfo = () => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={<Button mode="tertiary" onClick={handleBackClick}>Назад</Button>}
          right={<StarButton size="s" />}
        />

        <Div style={{ 
          padding: '20px 12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            padding: isMobile ? '16px 8px' : '32px'
          }}>
            {/* Заголовок секции */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <img
                src={affirmationIcon}
                alt="Affirmation icon"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.2,
                  marginBottom: '8px'
                }}>
                  Ежедневные аффирмации
                </h1>
                <div style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  textAlign: 'left',
                  fontFamily: 'Jost',
                  opacity: 0.9
                }}>
                  Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.
                </div>
              </div>
            </div>

            {/* Декоративные элементы и основной компонент */}
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

            <div style={{
              width: '100%',
              height: '2px',
              background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d) center/cover',
              marginBottom: '32px'
            }} />

            <DailyAffirmation />
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

export default DailyAffirmationPanel;
