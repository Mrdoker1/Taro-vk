import { FC } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  ConfigProvider,
  Button,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Calendar } from '../components/Calendar';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';
import { useResponsive } from '../hooks/useResponsive';
import { DEFAULT_VIEW_PANELS } from '../routes';
import calendarIcon from '../assets/calendar.svg';
import { BACKGROUND_BASE } from '../constants/styles';

export interface CalendarPanelProps extends NavIdProps {}

export const CalendarPanel: FC<CalendarPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();

  const handleBackClick = () => {
    routeNavigator.back();
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
              onClick={handleBackClick}
              style={{ 
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
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
              marginBottom: '8px'
            }}>
              <img
                src={calendarIcon}
                alt="Calendar icon"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain'
                }}
              />
              <div style={{ flex: 1 }}>
                <h1 style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.2,
                  marginBottom: '4px'
                }}>
                  Календарь активностей
                </h1>
                <p style={{
                  color: '#E8D28C',
                  fontSize: '14px',
                  fontWeight: '300',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.3,
                  opacity: 0.8
                }}>
                  Удобный способ отслеживать расклады, аффирмации, заметки и другие активности по дням.
                </p>
              </div>
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
              marginTop: '32px',
              marginBottom: '32px'
            }} />

            {/* Календарь */}
            <Calendar />

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