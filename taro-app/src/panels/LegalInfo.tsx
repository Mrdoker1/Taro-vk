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
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';
import { useResponsive } from '../hooks/useResponsive';

export interface LegalInfoProps extends NavIdProps {}

export const LegalInfo: FC<LegalInfoProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();

  const handleBackClick = () => {
    routeNavigator.back();
  };

  const handleAboutApp = () => {
    routeNavigator.push('/about-app');
  };

  const handleLegalInfo = () => {
    // Уже на странице "Правовая информация"
  };

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={
            <Button
              mode="tertiary"
              onClick={handleBackClick}
            >
              Назад
            </Button>
          }
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
                src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a454a9aefa63c89b1f3f6882a43da00885c70554?placeholderIfAbsent=true"
                alt="Legal info icon"
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
                Правовая информация
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

            {/* Основной контент */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {/* Пользовательское соглашение */}
              <div>
                <Title level="3" style={{ 
                  marginBottom: '12px',
                  color: '#E8D28C',
                  fontSize: '18px',
                  fontWeight: '500',
                  fontFamily: 'Jost'
                }}>
                  Пользовательское соглашение
                </Title>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontFamily: 'Jost',
                  lineHeight: 1.4
                }}>
                  Используя данное приложение, вы соглашаетесь с условиями использования.
                  Все функции приложения предоставляются "как есть" для развлекательных и 
                  образовательных целей.
                </Text>
              </div>
              
              {/* Политика конфиденциальности */}
              <div>
                <Title level="3" style={{ 
                  marginBottom: '12px',
                  color: '#E8D28C',
                  fontSize: '18px',
                  fontWeight: '500',
                  fontFamily: 'Jost'
                }}>
                  Политика конфиденциальности
                </Title>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontFamily: 'Jost',
                  lineHeight: 1.4
                }}>
                  Мы уважаем вашу конфиденциальность и защищаем ваши персональные данные.
                  Приложение не передает ваши данные третьим лицам и использует их только 
                  для обеспечения функциональности.
                </Text>
              </div>
              
              {/* Отказ от ответственности */}
              <div>
                <Title level="3" style={{ 
                  marginBottom: '12px',
                  color: '#E8D28C',
                  fontSize: '18px',
                  fontWeight: '500',
                  fontFamily: 'Jost'
                }}>
                  Отказ от ответственности
                </Title>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontFamily: 'Jost',
                  lineHeight: 1.4
                }}>
                  Гадания и предсказания носят развлекательный характер и не должны 
                  использоваться для принятия серьёзных жизненных решений. Помните, 
                  что ваша судьба в ваших руках.
                </Text>
              </div>
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

export default LegalInfo; 