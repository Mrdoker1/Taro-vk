import { FC } from 'react';
import { motion } from 'framer-motion';
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
import { useSafeNavigation } from '../utils/routerNavigation';
import calendarIcon from '../assets/calendar.svg';
import { BACKGROUND_BASE } from '../constants/styles';

export interface CalendarPanelProps extends NavIdProps {}

export const CalendarPanel: FC<CalendarPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const { safeBack } = useSafeNavigation();
  const isMobile = useResponsive();

  const handleBackClick = () => {
    safeBack();
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
          <motion.div 
            style={{
              width: '100%',
              ...BACKGROUND_BASE,
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              padding: isMobile ? '16px' : '32px'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Заголовок секции */}
            <motion.div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.img
                src={calendarIcon}
                alt="Calendar icon"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain'
                }}
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
            </motion.div>

            {/* Декоративный элемент */}
            <motion.div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.img
                src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a73aa4a82442cd6022e0ae5e650a0c240ffa4f01"
                alt="Decorative element"
                style={{
                  width: '90px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                animate={{ 
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

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
          </motion.div>
        </Div>

        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
}; 