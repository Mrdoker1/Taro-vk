import { FC, useState, useEffect, useCallback } from 'react';
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
import { CustomButton } from '../components/CustomButton';
import { useResponsive } from '../hooks/useResponsive';
import { useAppDispatch } from '../store';
import { checkPinConditions } from '../store/slices/pinsSlice';
import { purchaseStars } from '../store/slices/starsSlice';
import { DEFAULT_VIEW_PANELS } from '../routes';
import starbuyIcon from '../assets/starbuy.svg';
import starbuy100 from '../assets/starbuy100.svg';
import starbuy250 from '../assets/starbuy250.svg';
import starbuy500 from '../assets/starbuy500.svg';
import starbuy1000 from '../assets/starbuy1000.svg';
import { BACKGROUND_BASE } from '../constants/styles';

export interface StarsPurchaseProps extends NavIdProps {}

interface StarPackage {
  id: string;
  stars: number;
  votes: number;
  bonus?: number;
  popular?: boolean;
}

const starPackages: StarPackage[] = [
  {
    id: 'small',
    stars: 100,
    votes: 50,
  },
  {
    id: 'medium',
    stars: 250,
    votes: 100,
    bonus: 25,
  },
  {
    id: 'large',
    stars: 500,
    votes: 180,
    bonus: 70,
    popular: true,
  },
  {
    id: 'mega',
    stars: 1000,
    votes: 300,
    bonus: 200,
  },
];

export const StarsPurchase: FC<StarsPurchaseProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const isMobile = useResponsive();
  const dispatch = useAppDispatch();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Добавляем CSS анимации только один раз при монтировании
  useEffect(() => {
    const animationStyles = `
      @keyframes slideInUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 20px rgba(232, 210, 140, 0.3);
        }
        50% {
          box-shadow: 0 0 30px rgba(232, 210, 140, 0.6);
        }
      }
    `;

    // Вставляем стили в DOM только если их еще нет
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('stars-purchase-animations');
      if (!existingStyle) {
        const styleElement = document.createElement('style');
        styleElement.id = 'stars-purchase-animations';
        styleElement.textContent = animationStyles;
        document.head.appendChild(styleElement);
      }
    }

    // Cleanup function для удаления стилей при размонтировании
    return () => {
      const styleElement = document.getElementById('stars-purchase-animations');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const handleBackClick = useCallback(() => {
    routeNavigator.back();
  }, [routeNavigator]);

  const handleAboutApp = useCallback(() => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  }, [routeNavigator]);

  const handleLegalInfo = useCallback(() => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  }, [routeNavigator]);

  const handlePurchase = useCallback(async (packageData: StarPackage) => {
    setPurchasingId(packageData.id);
    
    try {
      // Используем новую функцию purchaseStars из store
      const result = await dispatch(purchaseStars({
        id: packageData.id,
        stars: packageData.stars,
        votes: packageData.votes,
        bonus: packageData.bonus
      })).unwrap();

      console.log('Покупка успешна:', result);
      
      // Разблокируем пин "Коллекционер Звезд" при любой успешной покупке
      dispatch(checkPinConditions({ type: 'stars_purchased', data: { packageId: packageData.id } }));
      
      // Показываем сообщение об успехе (можно добавить toast notification)
      console.log(result.message);
      
    } catch (error) {
      console.error('Ошибка при покупке:', error);
      // Показываем сообщение об ошибке (можно добавить toast notification)
    } finally {
      setPurchasingId(null);
    }
  }, [dispatch]);

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
          padding: isMobile ? '8px 0' : '20px 12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            margin: isMobile ? '0 12px' : '0 auto',
            ...BACKGROUND_BASE,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            padding: isMobile ? '16px' : '32px',
            boxSizing: 'border-box'
          }}>
            {/* Заголовок секции */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              justifyContent: 'flex-start',
              textAlign: 'left'
            }}>
              <img
                src={starbuyIcon}
                alt="Star icon"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                  marginRight: '8px'
                }}
              />
              <div>
                <Title level="1" style={{
                  color: '#ffffff',
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '600',
                  margin: 0,
                  fontFamily: 'Jost',
                  lineHeight: 1.2
                }}>
                  Добавить звезды
                </Title>
                <Text style={{
                  color: '#E8D28C',
                  fontSize: '14px',
                  fontWeight: '300',
                  margin: 0,
                  fontFamily: 'Jost',
                  marginTop: '4px'
                }}>
                  Обменивайте голоса ВКонтакте на звезды приложения
                </Text>
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
              marginBottom: '24px'
            }} />

            {/* Основной контент в две колонки */}
            <div style={{
              display: isMobile ? 'flex' : 'grid',
              gridTemplateColumns: isMobile ? undefined : '1fr 1.2fr',
              gap: isMobile ? '16px' : '32px',
              marginBottom: '24px',
              width: '100%',
              boxSizing: 'border-box',
              minWidth: 0,
              flexDirection: 'column',
            }}>
              
              {/* Левая колонка - Информация о звездах */}
              <div style={{
                width: isMobile ? '100%' : undefined,
                boxSizing: 'border-box',
                minWidth: 0
              }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: isMobile ? '16px' : '24px',
                  height: 'fit-content',
                  borderTop: '1px solid rgba(227,199,122,1)',
                  boxSizing: 'border-box',
                  width: '100%'
                }}>
                  <Title level="2" style={{
                    color: '#E8D28C',
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    fontFamily: 'Jost'
                  }}>
                    Получай звезды
                  </Title>
                  
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0',
                    fontFamily: 'Jost',
                    display: 'block'
                  }}>
                    Зарабатывай звезды за активность и трать их на уникальные расклады, коллекционные пины и магические артефакты.
                  </Text>

                  {/* Способы заработка */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level="3" style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '500',
                      margin: '0 0 12px 0',
                      fontFamily: 'Jost'
                    }}>
                      Зарабатывай за активность:
                    </Title>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: 'transparent',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(232, 211, 140, 0.5)',
                        }}>
                          <Text style={{ color: '#E8D28C', fontSize: '12px', fontWeight: '400' }}>+1</Text>
                        </div>
                        <Text style={{
                          color: '#E8D28C',
                          fontSize: '14px',
                          fontFamily: 'Jost',
                          fontWeight: '500'
                        }}>
                          Проводи расклад дня
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: 'transparent',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(232, 211, 140, 0.5)',
                        }}>
                          <Text style={{ color: '#E8D28C', fontSize: '12px', fontWeight: '400' }}>+1</Text>
                        </div>
                        <Text style={{
                          color: '#E8D28C',
                          fontSize: '14px',
                          fontFamily: 'Jost',
                          fontWeight: '500'
                        }}>
                          Напиши в дневник
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Дивайдер */}
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(232, 210, 140, 0.3), transparent)',
                    margin: '20px 0'
                  }} />

                  {/* Возможности */}
                  <div>
                    <Title level="3" style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '500',
                      margin: '0 0 12px 0',
                      fontFamily: 'Jost'
                    }}>
                      Трать на возможности:
                    </Title>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        'Уникальные расклады Таро',
                        'Персональные аффирмации',
                        'Детальные интерпретации',
                        'Коллекционные пины',
                      ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            className="checkmark-gold"
                            style={{
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </div>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '14px',
                            fontFamily: 'Jost'
                          }}>
                            {item}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая колонка - Пакеты звезд */}
              <div style={{
                width: isMobile ? '100%' : undefined,
                boxSizing: 'border-box',
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  {starPackages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      style={{
                        position: 'relative',
                        background: pkg.popular 
                          ? 'linear-gradient(135deg, rgba(232, 210, 140, 0.15), rgba(180, 163, 86, 0.1))' 
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        padding: '16px',
                        border: pkg.popular ? '2px solid #E8D28C' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        boxShadow: pkg.popular 
                          ? '0 8px 32px rgba(232, 210, 140, 0.25)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer',
                        transform: 'translateY(20px)',
                        opacity: 0,
                        animation: `slideInUp 0.6s ease-out ${index * 0.1}s forwards`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = pkg.popular 
                          ? '0 12px 40px rgba(232, 210, 140, 0.35)' 
                          : '0 8px 24px rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = pkg.popular 
                          ? '0 8px 32px rgba(232, 210, 140, 0.25)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.3)';
                      }}
                    >
                      {/* Популярный пакет */}
                      {pkg.popular && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '16px',
                          background: 'linear-gradient(90deg, #B8A356, #D4C075)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          fontFamily: 'Jost'
                        }}>
                          ПОПУЛЯРНО
                        </div>
                      )}

                      {/* Левая часть - Иконка и количество звезд */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: '1'
                      }}>
                        <img
                          src={
                            pkg.stars === 100 ? starbuy100 :
                            pkg.stars === 250 ? starbuy250 :
                            pkg.stars === 500 ? starbuy500 :
                            pkg.stars === 1000 ? starbuy1000 :
                            starbuy100
                          }
                          alt={pkg.stars + ' звезд'}
                          style={{
                            width: '44px',
                            height: '44px',
                            objectFit: 'contain'
                          }}
                        />
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <Text style={{
                              color: '#ffffff',
                              fontSize: '24px',
                              fontWeight: 'bold',
                              margin: 0,
                              fontFamily: 'Jost',
                              lineHeight: 1
                            }}>
                              {pkg.stars.toLocaleString()}
                            </Text>
                            <Text style={{
                              color: '#E8D28C',
                              fontSize: '12px',
                              fontWeight: '400',
                              margin: 0,
                              fontFamily: 'Jost'
                            }}>
                              звезд
                            </Text>
                          </div>
                          
                          {pkg.bonus && (
                            <Text style={{
                              color: '#F4E6A1',
                              fontSize: '12px',
                              fontWeight: '600',
                              margin: 0,
                              fontFamily: 'Jost',
                              marginTop: '2px'
                            }}>
                              + {pkg.bonus} бонус
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* Центральная часть - Дивайдер */}
                      <div style={{
                        width: '1px',
                        height: '40px',
                        background: 'linear-gradient(180deg, transparent, rgba(232, 210, 140, 0.3), transparent)'
                      }} />

                      {/* Правая часть - Цена и кнопка */}
                        <div style={{ 
                          textAlign: 'center',
                          marginRight: '12px'
                        }}>
                          <Text style={{
                            color: '#E8D28C',
                            fontSize: '18px',
                            fontWeight: '600',
                            margin: 0,
                            fontFamily: 'Jost',
                            lineHeight: 1
                          }}>
                            {pkg.votes}
                          </Text>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '11px',
                            fontWeight: '400',
                            margin: 0,
                            fontFamily: 'Jost'
                          }}>
                            голосов
                          </Text>
                        </div>
                        <CustomButton
                          variant={pkg.popular ? "primary" : "secondary"}
                          size="s"
                          disabled={purchasingId !== null}
                          onClick={() => handlePurchase(pkg)}
                          style={{
                            minWidth: '120px',
                            fontFamily: 'Jost',
                            fontWeight: '600',
                            width: isMobile ? '100%' : 'initial',
                          }}
                        >
                          {purchasingId === pkg.id ? '...' : 'Обменять'}
                        </CustomButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Нижний разделитель */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'rgba(232, 210, 140, 0.15)',
              marginBottom: '16px'
            }} />

            {/* Закрывающий декоративный элемент */}
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
