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
import { DEFAULT_VIEW_PANELS } from '../routes';
import pinAffirmation from '../assets/pin-affirmation.png';
import pinCalendar from '../assets/pin-calendar.png';
import pinSpreads from '../assets/pin-spreads.png';

export interface CollectionPinsProps extends NavIdProps {}

interface CollectionPin {
  id: string;
  name: string;
  description: string;
  requirement: string;
  image: string;
  isUnlocked: boolean;
}

// Моковые данные для пинов (в будущем будет из Redux store)
const collectionPins: CollectionPin[] = [
  {
    id: 'affirmation',
    name: 'Мастер Аффирмаций',
    description: 'Первые шаги в мире позитивных утверждений',
    requirement: 'Создайте свою первую аффирмацию',
    image: pinAffirmation,
    isUnlocked: false, // TODO: Получать из store
  },
  {
    id: 'calendar',
    name: 'Хранитель Воспоминаний',
    description: 'Ведение дневника - путь к самопознанию',
    requirement: 'Оставьте заметку в календаре',
    image: pinCalendar,
    isUnlocked: false, // TODO: Получать из store
  },
  {
    id: 'spreads',
    name: 'Ученик Таро',
    description: 'Первое знакомство с мудростью карт',
    requirement: 'Проведите свой первый расклад',
    image: pinSpreads,
    isUnlocked: true, // TODO: Получать из store
  },
];

export const CollectionPins: FC<CollectionPinsProps> = ({ id }) => {
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

  // Подсчет разблокированных пинов
  const unlockedCount = collectionPins.filter(pin => pin.isUnlocked).length;
  const totalCount = collectionPins.length;

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
              gap: '16px',
              marginBottom: '24px',
              justifyContent: 'center',
              textAlign: 'center',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(232, 210, 140, 0.15), rgba(180, 163, 86, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #E8D28C',
                boxShadow: '0 8px 32px rgba(232, 210, 140, 0.25)',
                fontSize: '32px'
              }}>
                🏆
              </div>
              
              <div>
                <Title level="1" style={{
                  color: '#ffffff',
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '600',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.2
                }}>
                  Коллекция Пинов
                </Title>
                <Text style={{
                  color: '#E8D28C',
                  fontSize: '14px',
                  fontWeight: '300',
                  margin: 0,
                  fontFamily: 'Jost',
                  marginTop: '4px'
                }}>
                  Собирайте достижения на вашем пути к мудрости
                </Text>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Jost',
                  marginTop: '8px'
                }}>
                  Собрано: {unlockedCount}/{totalCount}
                </Text>
              </div>
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
              {collectionPins.map((pin) => (
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
                    borderRadius: '12px',
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
                      src={pin.image} 
                      alt={pin.name}
                      style={{
                        width: isMobile ? '120px' : '150px',
                        height: isMobile ? '120px' : '150px',
                        objectFit: 'contain',
                        opacity: pin.isUnlocked ? 1 : 0.3,
                        filter: pin.isUnlocked ? 'none' : 'grayscale(100%)',
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
                Каждый пин - это веха на вашем пути самопознания. 
                Продолжайте исследовать мир Таро и аффирмаций!
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
