import { FC } from 'react';
import { UserInfo } from '@vkontakte/vk-bridge';
import {
  Panel,
  Div,
  NavIdProps,
  ConfigProvider,
  Button,
  Text,
  Title,
  Avatar,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { CustomButton } from '../components/CustomButton';
import { useResponsive } from '../hooks/useResponsive';
import { useAppSelector } from '../store';
import { DEFAULT_VIEW_PANELS } from '../routes';
import pinIcon from '../assets/pin.svg';

export interface ProfileProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Profile: FC<ProfileProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();
  
  // Получаем данные из store
  const { pins } = useAppSelector(state => state.pins);
  const { daysData } = useAppSelector(state => state.calendar);

  const handleBackClick = () => {
    routeNavigator.back();
  };

  const handleAboutApp = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  };

  const handleLegalInfo = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  };

  const handleGoToCollection = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.COLLECTION_PINS}`);
  };

  // Подсчет статистики
  const unlockedPinsCount = pins.filter(pin => pin.isUnlocked).length;
  const totalPinsCount = pins.length;
  
  // Получаем все активности из всех дней
  const allActivities = Object.values(daysData).flatMap(day => day.activities);
  const calendarActivitiesCount = allActivities.length;
  const affirmationsCount = allActivities.filter(activity => activity.type === 'affirmation').length;
  const tarotReadingsCount = allActivities.filter(activity => activity.type === 'tarot_reading').length;

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={
            <Button mode="tertiary" onClick={handleBackClick}>
              Назад
            </Button>
          }
          right={<StarButton size="s" />}
        />

        <Div style={{ 
          padding: '20px 12px',
          display: 'flex',
          justifyContent: 'flex-start'
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
              <Avatar size={60} src={photo_200} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.2
                }}>
                  {first_name ? `${first_name}` : 'Мой профиль'}
                </h1>
                <p style={{
                  color: '#E8D28C',
                  fontSize: '14px',
                  fontWeight: '300',
                  margin: '4px 0 0 0',
                  fontFamily: 'Jost'
                }}>
                  Ваш путь в мире Таро и аффирмаций
                </p>
              </div>
            </div>

            {/* Верхний декоративный элемент */}
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
              borderBottom: '0.5px solid rgba(201, 8, 8, 0.1)',
              marginBottom: '24px'
            }} />

            {/* Статистика */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '16px' : '20px',
              marginBottom: '24px'
            }}>
              {/* Общая статистика */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '20px',
                borderTop: '1px solid rgb(227, 199, 122)',
              }}>
                <Title level="3" style={{
                  color: '#E8D28C',
                  fontSize: '24px',
                  fontWeight: '500',
                  margin: '0 0 16px 0',
                  fontFamily: 'Jost'
                }}>
                  Общая статистика
                </Title>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                      Всего записей:
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500', fontFamily: 'Jost' }}>
                      {calendarActivitiesCount}
                    </Text>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                      Аффирмации:
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500', fontFamily: 'Jost' }}>
                      {affirmationsCount}
                    </Text>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                      Расклады Таро:
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500', fontFamily: 'Jost' }}>
                      {tarotReadingsCount}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Достижения и прогресс коллекции */}
              <div style={{
                background: 'rgba(232, 210, 140, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(232, 210, 140, 0.3)'
              }}>
                <Title level="3" style={{
                  color: '#E8D28C',
                  fontSize: '24px',
                  fontWeight: '500',
                  margin: '0 0 16px 0',
                  fontFamily: 'Jost'
                }}>
                  Коллекция достижений
                </Title>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                      Собрано пинов:
                    </Text>
                    <Text style={{ color: '#E8D28C', fontSize: '16px', fontWeight: '600', fontFamily: 'Jost' }}>
                      {unlockedPinsCount}/{totalPinsCount}
                    </Text>
                  </div>
                  
                  {/* Прогресс-бар */}
                  <div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: `${(unlockedPinsCount / totalPinsCount) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #E8D28C, #B4A356)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '12px',
                      fontFamily: 'Jost'
                    }}>
                      {Math.round((unlockedPinsCount / totalPinsCount) * 100)}% завершено
                    </Text>
                  </div>
                  
                  <CustomButton 
                    variant="secondary"
                    size="m"
                    onClick={handleGoToCollection}
                    icon={pinIcon}
                    style={{
                      width: '100%'
                    }}
                  >
                    Моя коллекция
                  </CustomButton>
                </div>
              </div>
            </div>

            {/* Нижний разделитель */}
            <div style={{
              width: '100%',
              borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
              margin: '24px 0 16px 0'
            }} />

            {/* Нижний декоративный элемент */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px'
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

            {/* Мотивационный текст */}
            <div style={{
              textAlign: 'center',
              padding: '16px'
            }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontWeight: '400',
                fontFamily: 'Jost',
                fontStyle: 'italic'
              }}>
                Каждая практика приближает вас к гармонии с собой. 
                Продолжайте свой путь самопознания!
              </Text>
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
