import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  Div,
  Text,
  Title,
  Button,
  ConfigProvider
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';
import { useResponsive } from '../hooks/useResponsive';
import { useSafeNavigation } from '../utils/routerNavigation';
import thumbnail from '../assets/thumbnail.png';
import appIcon from '../assets/app.svg';
import { BACKGROUND_BASE } from '../constants/styles';

export interface AboutAppProps extends NavIdProps {}

export const AboutApp: FC<AboutAppProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const { safeBack } = useSafeNavigation();
  const isMobile = useResponsive();

  const handleBackClick = () => {
    safeBack();
  };

  const handleAboutApp = () => {
    // Уже на странице "О приложении"
  };

  const handleLegalInfo = () => {
    routeNavigator.push('/legal-info');
  };

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={
            <Button
              mode="tertiary"
              onClick={handleBackClick}
              style={{ 
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              Назад
            </Button>
          }
        />
        
        <Div style={{ 
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            ...BACKGROUND_BASE,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            padding: isMobile ? '16px' : '32px'
          }}>
            {/* Заголовок секции */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <img
                src={appIcon}
                alt="About app icon"
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
                О приложении
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

            {/* Thumbnail изображение */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <img
                  src={thumbnail}
                  alt="Seluna App"
                  style={{
                    maxWidth: '200px',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    overflow: 'hidden',
                    // boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    // border: '1px solid rgba(232, 210, 140, 0.2)'
                  }}
                />
              </div>

            {/* Основной контент */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <Title level="2" style={{ 
                color: '#E8D28C',
                fontSize: '20px',
                fontWeight: '500',
                fontFamily: 'Jost'
              }}>
                Seluna - расклады и советы Таро
              </Title>

              {/* <Text style={{ 
                color: '#E8D28C',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Jost'
              }}>
                Версия: 1.0.0
              </Text> */}
              
              <Text style={{ 
                marginBottom: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontFamily: 'Jost',
                lineHeight: 1.4
              }}>
                Приложение для гадания на картах Таро, получения ежедневных аффирмаций 
                и ведения духовного дневника.
              </Text>
              
              <Text style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontFamily: 'Jost',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                Откройте для себя мир Таро и духовного развития вместе с нашим приложением.
                Каждая карта несет в себе мудрость веков, а аффирмации помогают обрести 
                внутреннюю гармонию.
              </Text>
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

export default AboutApp; 