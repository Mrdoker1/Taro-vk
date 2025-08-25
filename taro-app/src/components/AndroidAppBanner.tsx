import { FC, useEffect, useState } from 'react';
import { CustomButton } from './CustomButton';
import phoneImage from '../assets/phonescreen.png';
import googlePlayIcon from '../assets/googleplay.svg';
import bannerBg from '../assets/bannerbackground.png';

interface AndroidAppBannerProps {
  onClickStore?: () => void;
  backgroundImageUrl?: string; // optional background image
}

export const AndroidAppBanner: FC<AndroidAppBannerProps> = ({ onClickStore, backgroundImageUrl }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <section
      style={{
        borderRadius: '8px',
        border: '1px solid rgba(227,199,122,0.15)',
        display: 'flex',
        position: 'relative',
        width: '100%',
        minHeight: 'auto',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 24px)',
        padding: 'clamp(6px, 2vw, 9px)',
        overflow: 'visible',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: isMobile ? '24px' : 'clamp(40px, 6vw, 120px)',
          overflow: 'visible',
          backgroundColor: 'transparent',
          padding: '10px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          position: 'relative',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
      >
        {/* Background (center fill, lower opacity) */}
    {(backgroundImageUrl || bannerBg) && (
      <img
      src={backgroundImageUrl || bannerBg}
            alt="Banner background"
            style={{
              border: '1px solid rgba(227,199,122,1)',
              borderRadius: '8px',
              position: 'absolute',
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              inset: 0,
        opacity: 0.2,
              objectPosition: 'center',
        filter: 'brightness(1.1)',
              zIndex: 0,
            }}
          />
        )}
        {/* Image left (always slightly protruding) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 1,
            // Force protrusion outside banner vertically beyond inner padding
            marginTop: '-18%',
            marginBottom: '-18%',
            marginLeft: isMobile ? 0 : 'clamp(24px, 8vw, 140px)',
          }}
        >
          <img
            src={phoneImage}
            alt="Android app preview"
            style={{
              width: isMobile ? '150px' : '140px',
              height: isMobile ? '270px' : '260px',
              objectFit: 'contain',
              display: 'block',
              marginTop: 0,
              marginBottom: 0,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Text (left) and Button (right) in one container */}
        <div
          style={{
            position: 'relative',
            minWidth: 0,
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 'clamp(8px, 2vw, 24px)',
            zIndex: 1,
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h1
              style={{
                fontFamily: 'Jost',
                fontWeight: 400,
                fontSize: isMobile ? '22px' : '26px',
                lineHeight: 1.25,
                margin: '0 0 6px 0',
                color: 'white',
                letterSpacing: '0.2px',
              }}
            >
              Наше приложение
              <br />
              теперь на Android!
            </h1>

            <p
              style={{
                fontSize: isMobile ? '13px' : '16px',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 300,
                lineHeight: 1.5,
                margin: '0 0 10px 0',
              }}
            >
              Еще больше функций и удобный доступ к раскладам и дневнику. Все возможности в одном месте — прямо на твоём смартфоне.
            </p>

            <img
              src={googlePlayIcon}
              alt="Get it on Google Play"
              style={{
                width: isMobile ? '140px' : '180px',
                height: 'auto',
                objectFit: 'contain',
                cursor: onClickStore ? 'pointer' : 'default',
              }}
              onClick={() => onClickStore && onClickStore()}
            />
          </div>

          <div
            style={{
              flexShrink: 0,
              alignSelf: isMobile ? 'flex-start' : 'center',
              marginTop: isMobile ? '8px' : 0,
            }}
          >
            <CustomButton
              variant="primary"
              size="m"
              mobileSize="xs"
              onClick={() => onClickStore && onClickStore()}
              style={{ minWidth: 'auto', zIndex: 1 }}
            >
              Попробовать сейчас
            </CustomButton>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default AndroidAppBanner;
