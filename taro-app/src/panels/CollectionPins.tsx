import { FC } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  ConfigProvider,
  Button,
  Text,
  Title,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { useResponsive } from '../hooks/useResponsive';
import { useAppSelector, useAppDispatch } from '../store';
import { resetPins } from '../store/slices/pinsSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import pinAffirmation from '../assets/pin-affirmation.png';
import pinCalendar from '../assets/pin-calendar.png';
import pinSpreads from '../assets/pin-spreads.png';
import pinIcon from '../assets/pin.svg';

export interface CollectionPinsProps extends NavIdProps {}

// Маппинг изображений для пинов
const pinImages: Record<string, string> = {
  affirmation: pinAffirmation,
  calendar: pinCalendar,
  spreads: pinSpreads,
};

export const CollectionPins: FC<CollectionPinsProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();
  const dispatch = useAppDispatch();
  
  // Получаем пины из store
  const pins = useAppSelector(state => state.pins.pins);

  const handleBackClick = () => {
    routeNavigator.back();
  };

  const handleAboutApp = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  };

  const handleLegalInfo = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  };

  const handleResetPins = () => {
    dispatch(resetPins());
  };

  // Подсчет разблокированных пинов
  const unlockedCount = pins.filter(pin => pin.isUnlocked).length;
  const totalCount = pins.length;

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
              <img 
                src={pinIcon} 
                alt="Pin Icon"
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
                  lineHeight: 1.2
                }}>
                  Коллекция Пинов
                </h1>
                <p style={{
                  color: '#E8D28C',
                  fontSize: '14px',
                  fontWeight: '300',
                  margin: '4px 0 0 0',
                  fontFamily: 'Jost'
                }}>
                  Собирайте достижения на вашем пути к мудрости
                </p>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontWeight: '400',
                margin: 0,
                fontFamily: 'Jost'
              }}>
                Собрано: {unlockedCount}/{totalCount}
              </p>
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
              height: '1px',
              background: 'rgba(232, 210, 140, 0.15)',
              marginBottom: '24px'
            }} />

            {/* Список пинов */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(3, 1fr)',
              gap: isMobile ? '16px' : '20px'
            }}>
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    background: pin.isUnlocked 
                      ? 'linear-gradient(135deg, rgba(232, 210, 140, 0.15), rgba(180, 163, 86, 0.1))' 
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    padding: isMobile ? '16px' : '20px',
                    border: pin.isUnlocked 
                      ? '2px solid #E8D28C' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    boxShadow: pin.isUnlocked 
                      ? '0 8px 32px rgba(232, 210, 140, 0.25)' 
                      : '0 4px 16px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                    opacity: pin.isUnlocked ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Иконка пина */}
                  <div style={{
                    width: isMobile ? '120px' : '150px',
                    height: isMobile ? '120px' : '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <img 
                      src={pinImages[pin.id] || pin.image} 
                      alt={pin.name}
                      style={{
                        width: isMobile ? '120px' : '150px',
                        height: isMobile ? '120px' : '150px',
                        objectFit: 'contain',
                        opacity: pin.isUnlocked ? 1 : 0.3,
                        filter: pin.isUnlocked ? 
                          `drop-shadow(0 0 15px rgba(232, 210, 140, 0.3)) 
                           drop-shadow(0 0 25px rgba(232, 210, 140, 0.2)) 
                           drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))
                           brightness(1.05) saturate(1.1)` 
                          : 'grayscale(100%) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Информация о пине */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <Title level="3" style={{
                        color: pin.isUnlocked ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        fontFamily: 'Jost'
                      }}>
                        {pin.name}
                      </Title>
                      
                      <Text style={{
                        color: pin.isUnlocked ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '400',
                        margin: '0 0 6px 0',
                        fontFamily: 'Jost',
                        display: 'block',
                        lineHeight: 1.4
                      }}>
                        {pin.description}
                      </Text>
                    </div>

                    {/* Разделитель */}
                    <div style={{
                      width: '100%',
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                      margin: '8px 0'
                    }} />

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      {pin.isUnlocked ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span className="checkmark-gold" style={{
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </span>
                          <Text style={{
                            color: '#E8D28C',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Jost'
                          }}>
                            Получено!
                          </Text>
                        </div>
                      ) : (
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '400',
                          fontFamily: 'Jost',
                          textAlign: 'center'
                        }}>
                          {pin.requirement}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Нижний разделитель */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'rgba(232, 210, 140, 0.15)',
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
              padding: '16px',
              marginTop: '8px'
            }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontWeight: '400',
                fontFamily: 'Jost',
                fontStyle: 'italic'
              }}>
                Каждый пин - это веха на вашем пути самопознания. 
                Продолжайте исследовать мир Таро и аффирмаций!
              </Text>
            </div>

            {/* Кнопка сброса для разработки */}
            {import.meta.env.DEV && (
              <div style={{
                textAlign: 'center',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Button 
                  mode="tertiary" 
                  size="s" 
                  onClick={handleResetPins}
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px'
                  }}
                >
                  Сбросить пины (разработка)
                </Button>
              </div>
            )}
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
