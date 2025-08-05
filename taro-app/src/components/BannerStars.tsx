import { FC, useState, useEffect } from 'react';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { CustomButton } from './CustomButton';
import { DEFAULT_VIEW_PANELS } from '../routes';
import bagImage from '../assets/bag.png';

interface BannerStarsProps {
  onLearnMore?: () => void;
}

export const BannerStars: FC<BannerStarsProps> = ({ onLearnMore }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const routeNavigator = useRouteNavigator();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      // По умолчанию переходим на страницу покупки звезд
      routeNavigator.push(`/${DEFAULT_VIEW_PANELS.STARS_PURCHASE}`);
    }
  };

  return (
    <section 
      style={{
        borderRadius: '8px',
        border: '1px solid rgba(227,199,122,0.3)',
        display: 'flex',
        position: 'relative',
        width: '100%',
        minHeight: 'auto',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 24px)',
        padding: 'clamp(6px, 2vw, 9px)',
        overflow: 'hidden',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
      }}
    >
      {/* Внутренняя обводка */}
      <div style={{
        border: '1px solid rgba(227,199,122,0.3)',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 24px)',
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        padding: 'clamp(16px, 4vw, 32px)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        position: 'relative',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Фоновое изображение */}
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/0cb3b98a5010017aa4aa8631bb889f4c8ddd7442"
          alt="Rewards background"
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            inset: '0',
            opacity: 0.3, // уменьшаем непрозрачность фона
            zIndex: 0,
          }}
        />
        
        {/* Изображение сумки слева */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(16px, 3vw, 24px)',
          width: isMobile ? '100%' : 'auto',
          flex: isMobile ? 'none' : 'auto'
        }}>
          <img
            src={bagImage}
            alt="Bag illustration"
            style={{
              width: 'clamp(100px, 15vw, 180px)', // увеличенный размер
              height: 'clamp(100px, 15vw, 180px)', // увеличенный размер
              objectFit: 'contain',
              flexShrink: 0,
              zIndex: 10,
            }}
          />
          
          {/* Контент */}
          <div 
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
              zIndex: 10,
            }}
          >
            <h1 
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'Jost',
                fontWeight: 400,
                fontSize: 'clamp(18px, 5vw, 24px)', // адаптивный размер шрифта
                lineHeight: 1.2,
                margin: '0 0 12px 0',
                color: 'white',
              }}
            >
              Получай звезды
            </h1>
            <p 
              style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)', // адаптивный размер
                color: 'rgba(255,255,255,0.75)', // 75% прозрачность
                fontWeight: 'normal',
                lineHeight: '1.5',
                margin: '0 0 12px 0',
              }}
            >
              Зарабатывай звезды за активность и трать их на уникальные
              расклады, коллекционные пины и магические артефакты.
            </p>
            <div 
              style={{
                fontSize: 'clamp(13px, 3vw, 15px)', // адаптивный размер
                color: '#E8D28C', // золотой цвет текста
                lineHeight: '1.5',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'transparent',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid #E8D28C',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#E8D28C', fontSize: '10px', fontWeight: 'bold' }}>+1</span>
                </div>
                <span>Проводи расклад дня +1 звезда</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'transparent',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid #E8D28C',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#E8D28C', fontSize: '10px', fontWeight: 'bold' }}>+1</span>
                </div>
                <span>Напиши в дневник +1 звезда</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопка справа без дополнительного контейнера */}
        <CustomButton
          variant="primary"
          size="m"
          mobileSize="xs"
          onClick={handleLearnMore}
          style={{
            minWidth: 'auto',
            flexShrink: 0,
            zIndex: 10,
            alignSelf: isMobile ? 'flex-end' : 'center', // справа в мобильной версии
            width: isMobile ? 'auto' : 'auto'
          }}
        >
          Узнать больше
        </CustomButton>
      </div>
    </section>
  );
};
