import { FC, useEffect } from 'react';
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
import { CustomButton } from '../components/CustomButton';
import { useResponsive } from '../hooks/useResponsive';
import { useAppSelector, useAppDispatch } from '../store';
import { loadCalendarData } from '../store/slices/calendarSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { BACKGROUND_BASE } from '../constants/styles';
import { useSafeNavigation } from '../utils/routerNavigation';

export interface ProfileProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Profile: FC<ProfileProps> = ({ id, fetchedUser }) => {
  const { photo_200, first_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const { safeBack } = useSafeNavigation();
  const dispatch = useAppDispatch();
  const isMobile = useResponsive();
  
  // Получаем данные из store
  const { pins } = useAppSelector(state => state.pins);
  const { daysData } = useAppSelector(state => state.calendar);

  // Инициализируем календарные данные при загрузке компонента
  useEffect(() => {
    dispatch(loadCalendarData());
  }, [dispatch]);

  const handleBackClick = () => {
    safeBack();
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
  
  // Подсчитываем заметки
  const notesCount = Object.values(daysData).filter(day => day.note).length;
  
  // Общий счетчик активностей включая заметки
  const totalActivitiesCount = calendarActivitiesCount + notesCount;

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
          justifyContent: 'flex-start'
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
              <Avatar size={56} src={photo_200} style={{ flexShrink: 0 }} />
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
              borderTop: '1px solid rgba(232, 210, 140, 0.15)',
              marginBottom: '24px'
            }} />

            {/* Статистика */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '16px' : '20px',
              marginBottom: '24px'
            }}>
              {/* Общая статистика с графиками */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '20px',
                borderTop: '1px solid rgb(227, 199, 122)'
              }}>
                <Title level="3" style={{
                  color: '#E8D28C',
                  fontSize: '24px',
                  fontWeight: '500',
                  margin: '0 0 20px 0',
                  fontFamily: 'Jost'
                }}>
                  Общая статистика
                </Title>
                
                {/* Круговая диаграмма активностей */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Левая часть - круговая диаграмма и легенда */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Круговая диаграмма */}
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'flex-start'
                    }}>
                      <div style={{ 
                        position: 'relative',
                        width: '70px',
                        height: '70px',
                        flexShrink: 0
                      }}>
                        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                          {/* Фон круга */}
                          <circle
                            cx="35"
                            cy="35"
                            r="30"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="6"
                          />
                          {/* Аффирмации */}
                          {affirmationsCount > 0 && totalActivitiesCount > 0 && (
                            <circle
                              cx="35"
                              cy="35"
                              r="30"
                              fill="none"
                              stroke="#ff9800"
                              strokeWidth="6"
                              strokeDasharray={`${(affirmationsCount / totalActivitiesCount) * 188.5} 188.5`}
                              strokeLinecap="round"
                            />
                          )}
                          {/* Таро */}
                          {tarotReadingsCount > 0 && totalActivitiesCount > 0 && (
                            <circle
                              cx="35"
                              cy="35"
                              r="30"
                              fill="none"
                              stroke="#9c27b0"
                              strokeWidth="6"
                              strokeDasharray={`${(tarotReadingsCount / totalActivitiesCount) * 188.5} 188.5`}
                              strokeDashoffset={`-${(affirmationsCount / totalActivitiesCount) * 188.5}`}
                              strokeLinecap="round"
                            />
                          )}
                          {/* Заметки */}
                          {notesCount > 0 && totalActivitiesCount > 0 && (
                            <circle
                              cx="35"
                              cy="35"
                              r="30"
                              fill="none"
                              stroke="#4caf50"
                              strokeWidth="6"
                              strokeDasharray={`${(notesCount / totalActivitiesCount) * 188.5} 188.5`}
                              strokeDashoffset={`-${((affirmationsCount + tarotReadingsCount) / totalActivitiesCount) * 188.5}`}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <Text style={{
                            color: '#E8D28C',
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Jost',
                            lineHeight: 1
                          }}>
                            {totalActivitiesCount}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Легенда под кругом */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#ff9800'
                        }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px', fontFamily: 'Jost' }}>
                          Аффирмации: {affirmationsCount}
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9c27b0'
                        }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px', fontFamily: 'Jost' }}>
                          Расклады Таро: {tarotReadingsCount}
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#4caf50'
                        }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px', fontFamily: 'Jost' }}>
                          Заметки: {notesCount}
                        </Text>
                      </div>
                    </div>
                    {/* Разделитель */}
                    <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                    }} />
                    {/* Дополнительные метрики */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                        Среднее в день:
                        </Text>
                        <Text style={{ color: '#E8D28C', fontSize: '14px', fontWeight: '400', fontFamily: 'Jost' }}>
                        {totalActivitiesCount > 0 ? (totalActivitiesCount / Object.keys(daysData).length).toFixed(1) : '0'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                        записей
                        </Text>
                    </div>
                  </div>

                  {/* Правая часть - активность по дням */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      fontFamily: 'Jost',
                      marginBottom: '8px'
                    }}>
                      Активность по дням:
                    </Text>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                        const dayActivities = Object.values(daysData).filter(dayData => {
                          const date = new Date(dayData.date);
                          const dayOfWeek = (date.getDay() + 6) % 7;
                          return dayOfWeek === index;
                        }).reduce((sum, dayData) => sum + dayData.activities.length + (dayData.note ? 1 : 0), 0);

                        const maxActivities = Math.max(1, ...Array.from({ length: 7 }, (_, i) => 
                          Object.values(daysData).filter(dayData => {
                            const date = new Date(dayData.date);
                            const dayOfWeek = (date.getDay() + 6) % 7;
                            return dayOfWeek === i;
                          }).reduce((sum, dayData) => sum + dayData.activities.length + (dayData.note ? 1 : 0), 0)
                        ));

                        const intensity = dayActivities / maxActivities;

                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Text style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '10px',
                              fontFamily: 'Jost',
                              width: '16px',
                              textAlign: 'center'
                            }}>
                              {day}
                            </Text>
                            
                            <div style={{
                              flex: 1,
                              height: '10px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${intensity * 100}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, 
                                  rgba(255, 152, 0, ${0.4 + intensity * 0.6}), 
                                  rgba(156, 39, 176, ${0.3 + intensity * 0.5}),
                                  rgba(76, 175, 80, ${0.3 + intensity * 0.4})
                                )`,
                                borderRadius: '5px',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>

                            <Text style={{
                              color: '#E8D28C',
                              fontSize: '10px',
                              fontFamily: 'Jost',
                              fontWeight: '600',
                              width: '12px',
                              textAlign: 'center'
                            }}>
                              {dayActivities}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Достижения и прогресс коллекции */}
              <div style={{
                background: 'rgba(232, 210, 140, 0.1)',
                padding: '20px',
                borderRadius: '3px',
                border: '1px solid rgba(232, 210, 140, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Title level="3" style={{
                  color: '#E8D28C',
                  fontSize: '24px',
                  fontWeight: '500',
                  margin: '0 0 20px 0',
                  fontFamily: 'Jost',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Коллекция достижений
                </Title>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
                  {/* Круговой прогресс */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px'
                  }}>
                    <div style={{ 
                      position: 'relative',
                      width: '70px',
                      height: '70px',
                      flexShrink: 0
                    }}>
                      <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Фон круга */}
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="6"
                        />
                        {/* Прогресс */}
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="6"
                          strokeDasharray={`${(unlockedPinsCount / totalPinsCount) * 188.5} 188.5`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E8D28C" />
                            <stop offset="100%" stopColor="#B4A356" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <Text style={{
                          color: '#E8D28C',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'Jost',
                          lineHeight: 1
                        }}>
                          {Math.round((unlockedPinsCount / totalPinsCount) * 100)}%
                        </Text>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontFamily: 'Jost' }}>
                          Собрано пинов:
                        </Text>
                        <Text style={{ color: '#E8D28C', fontSize: '18px', fontWeight: '400', fontFamily: 'Jost' }}>
                          {unlockedPinsCount}/{totalPinsCount}
                        </Text>
                      </div>
                      
                      {/* Линейный прогресс-бар */}
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '6px'
                      }}>
                        <div style={{
                          width: `${(unlockedPinsCount / totalPinsCount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #E8D28C, #B4A356)',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                          boxShadow: '0 0 8px rgba(232, 210, 140, 0.3)'
                        }} />
                      </div>
                      
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '11px',
                        fontFamily: 'Jost'
                      }}>
                        {unlockedPinsCount === totalPinsCount ? 'Коллекция завершена!' : `Осталось: ${totalPinsCount - unlockedPinsCount} пинов`}
                      </Text>
                    </div>
                  </div>

                  {/* Последние достижения */}
                  <div style={{
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      fontFamily: 'Jost',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Последние достижения:
                    </Text>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {pins
                        .filter(pin => pin.isUnlocked)
                        .slice(-3)
                        .map((pin) => (
                          <div key={pin.id} style={{
                            padding: '4px 12px',
                            borderRadius: '50px',
                            border: '1px solid rgba(232, 210, 140, 0.3)'
                          }}>
                            <Text style={{
                              color: '#E8D28C',
                              fontSize: '12px',
                              fontFamily: 'Jost',
                              fontWeight: '500'
                            }}>
                              {pin.name}
                            </Text>
                          </div>
                        ))
                      }
                      {pins.filter(pin => pin.isUnlocked).length === 0 && (
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '10px',
                          fontFamily: 'Jost',
                          fontStyle: 'italic'
                        }}>
                          Пока нет достижений
                        </Text>
                      )}
                    </div>
                  </div>
                  
                  <CustomButton 
                    variant="secondary"
                    size="m"
                    onClick={handleGoToCollection}
                    style={{
                      width: '100%',
                      background: unlockedPinsCount === totalPinsCount 
                        ? 'linear-gradient(90deg, #E8D28C, #B4A356)' 
                        : undefined,
                      color: unlockedPinsCount === totalPinsCount ? '#000' : undefined
                    }}
                  >
                    {unlockedPinsCount === totalPinsCount ? 'Посмотреть коллекцию' : 'Моя коллекция'}
                  </CustomButton>
                </div>
              </div>
            </div>

            {/* Нижний разделитель */}
            <div style={{
              width: '100%',
              borderTop: '1px solid rgba(232, 210, 140, 0.15)',
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
