import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import phoneImage from '../assets/phonescreen.png';
import googlePlayIcon from '../assets/googleplay.svg';
import bannerBg from '../assets/bannerbackground.png';

interface AndroidAppBannerProps {
  backgroundImageUrl?: string; // optional background image
}

/** Информационный баннер: приложение есть в Google Play. Без ссылки и кнопки (ограничения маркетплейса). */
export const AndroidAppBanner: FC<AndroidAppBannerProps> = ({ backgroundImageUrl }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
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
      <motion.img
      src={backgroundImageUrl || bannerBg}
            alt="Banner background"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ 
              opacity: 0.08, 
              scale: 1,
            }}
            transition={{ 
              duration: 1.2, 
              ease: 'easeOut',
            }}
            style={{
              border: '1px solid rgba(227,199,122,1)',
              borderRadius: '8px',
              position: 'absolute',
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              inset: 0,
              objectPosition: 'center',
        filter: 'brightness(0.7) saturate(0.6)',
              zIndex: 0,
            }}
          />
        )}
        {/* Image left (always slightly protruding) */}
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -10 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            rotate: 0,
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2, 
            ease: [0.34, 1.56, 0.64, 1],
          }}
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
          <motion.img
            src={phoneImage}
            alt="Android app preview"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
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
        </motion.div>

        {/* Текст и иконка маркета — только информация, без ссылки и кнопки */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          style={{
            position: 'relative',
            minWidth: 0,
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'flex-start',
            gap: 'clamp(8px, 2vw, 24px)',
            zIndex: 1,
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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
              в Google Play
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                fontSize: isMobile ? '13px' : '16px',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 300,
                lineHeight: 1.5,
                margin: '0 0 0 0',
              }}
            >
              Seluna доступна в Google Play. Ещё больше функций, расклады и дневник — всё в одном приложении на твоём смартфоне.
            </motion.p>

            <motion.img
              src={googlePlayIcon}
              alt="Доступно в Google Play"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.03, 1],
              }}
              transition={{ 
                opacity: { duration: 0.6, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{
                width: isMobile ? '140px' : '180px',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
                marginTop: 0,
                marginBottom: '20px',
              }}
            />
          </div>
        </motion.div>
        
      </div>
    </motion.section>
  );
};

export default AndroidAppBanner;
