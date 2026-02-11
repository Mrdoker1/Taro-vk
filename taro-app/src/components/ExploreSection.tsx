import React from 'react';
import { motion } from 'framer-motion';
import { CustomTooltip } from './CustomTooltip';
import { CustomButton } from './CustomButton';
import exploreAImage from '../assets/explore-a.png';
import exploreBImage from '../assets/explore-b.png';
import exploreCImage from '../assets/explore-c.png';
import { BACKGROUND_BASE } from '../constants/styles';

interface ExploreSectionProps {
  onOpenSpreads: () => void;
  onOpenAffirmations: () => void;
  onOpenCalendar: () => void;
}

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Отслеживание размера окна
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isVerySmallMobile = windowWidth < 480;

  return (
    <motion.div 
      style={{
        border: '1px solid rgba(227, 199, 122, 0.15)',
        borderRadius: isMobile ? '6px' : '500px 500px 4px 4px',
        padding: isMobile ? '6px' : '8px',
        flex: isMobile ? 'none' : '1',
        minWidth: isMobile ? 'auto' : '240px',
        maxWidth: isMobile ? 'calc(100% - 8px)' : '320px',
        width: isMobile ? 'auto' : 'auto',
        height: isMobile ? 'auto' : 'fit-content',
        backgroundColor: 'transparent',
      }}
      whileHover={{ 
        y: -8,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
    >
      <div style={{
        border: '1px solid rgba(227, 199, 122, 0.15)',
        borderRadius: isMobile ? '0px' : '500px 500px 0px 0px',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'column',
        alignItems: isMobile ? 'stretch' : 'stretch',
        height: 'auto'
      }}>
        {/* Изображение карточки */}
        <div style={{
          position: 'relative',
          width: isMobile ? '100%' : '100%',
          height: isMobile ? '120px' : '100%',
          aspectRatio: isMobile ? 'auto' : '1.663',
          flexShrink: 0
        }}>
          <img 
            src={
              title === 'Гадание на картах Таро' ? exploreAImage :
              title === 'Аффирмации' ? exploreBImage : exploreCImage
            }
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: isMobile ? '4px' : '0'
            }}
          />
          
          {/* Тултип в правом нижнем углу - только для десктопа */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px'
            }}>
              <CustomTooltip
                content={
                  title === 'Гадание на картах Таро' ? 
                    'Выбери расклад карт Таро для получения предсказания и ответов на твои вопросы' :
                   title === 'Аффирмации' ?
                    'Получи позитивные утверждения для настройки на успешный день и привлечения желаемого' :
                    'Ведите духовный дневник, отслеживайте расклады и аффирмации для своего развития'
                }
                ariaLabel={`Показать справку о разделе ${title}`}
              />
            </div>
          )}
        </div>
        
        {/* Контент */}
        <div style={{
          padding: isMobile ? '12px 16px' : '32px 14px',
          textAlign: isMobile ? 'left' : 'center',
          backgroundColor: 'transparent',
          flex: isMobile ? 1 : 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'space-between' : 'center'
        }}>
          <div style={{
            maxWidth: isMobile ? 'none' : '283px',
            margin: isMobile ? '0' : '0 auto',
            flex: isMobile ? 1 : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <h3 style={{
              fontSize: isVerySmallMobile ? '18px' : isMobile ? '20px' : '24px',
              fontWeight: '500',
              lineHeight: '1.3',
              margin: isMobile ? '0 0 4px 0' : '0 0 12px 0',
              color: 'white'
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '300',
              lineHeight: '1.3',
              margin: isMobile ? '0 0 8px 0' : '0 0 24px 0',
              color: 'white',
              display: isMobile ? '-webkit-box' : 'block',
              WebkitLineClamp: isMobile ? 3 : 'none',
              WebkitBoxOrient: isMobile ? 'vertical' : 'unset',
              overflow: isMobile ? 'hidden' : 'visible'
            }}>
              {description}
            </p>
          </div>
          
          <CustomButton
            variant="secondary"
            size="m"
            mobileSize="xs"
            onClick={onButtonClick}
            style={{
              width: isMobile ? 'auto' : '100%',
              maxWidth: isMobile ? 'none' : '280px',
              alignSelf: 'flex-end'
            }}
          >
            {buttonText}
          </CustomButton>
        </div>
      </div>
    </motion.div>
  );
};

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onOpenSpreads,
  onOpenAffirmations,
  onOpenCalendar
}) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Отслеживание размера окна
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Адаптивность для мобильных устройств
  const isMobile = windowWidth < 768;
  const isVerySmallMobile = windowWidth < 480;

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: isMobile ? '12px' : '16px',
    position: 'relative',
    minHeight: '600px',
    width: '100%',
    overflow: 'hidden',
    padding: isVerySmallMobile ? '12px' : isMobile ? '16px' : '24px',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...BACKGROUND_BASE,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const headerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    color: 'white',
    fontWeight: 500,
    lineHeight: 1.2,
    flexWrap: 'wrap'
  };

  const iconStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    objectFit: 'contain',
    flexShrink: 0
  };

  const titleStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Jost',
    fontWeight: 400,
    fontSize: isVerySmallMobile ? '18px' : isMobile ? '20px' : '24px',
    lineHeight: 1.2,
    margin: 0
  };

  const contentWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    marginTop: '12px'
  };

  const features = [
    {
      title: "Гадание на картах Таро",
      description: "Выбери один из доступных раскладов и получи предсказание на интересующий тебя вопрос.",
      buttonText: "Выбрать расклад",
      onButtonClick: onOpenSpreads
    },
    {
      title: "Аффирмации",
      description: "Позитивные утверждения помогут тебе настроиться на успешный день и привлечь желаемое в свою жизнь.",
      buttonText: "Получить аффирмации",
      onButtonClick: onOpenAffirmations
    },
    {
      title: "Твой духовный дневник",
      description: "Отслеживай свои расклады Таро, аффирмации и ведите заметки о своем духовном развитии.",
      buttonText: "Открыть календарь",
      onButtonClick: onOpenCalendar
    }
  ];

  return (
    <motion.section 
      style={sectionStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
    >
      {/* Фоновое изображение */}
      <motion.div 
        style={backgroundStyle}
        animate={{ 
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Заголовок секции */}
      <motion.div 
        style={headerStyle}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/8fe9fd736d65fcb16451a2d349310471db362c0c?placeholderIfAbsent=true"
          alt="Explore icon"
          style={iconStyle}
          animate={{ 
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <h2 style={titleStyle}>
          Исследуй Таро
        </h2>
      </motion.div>
      
      {/* Контент секции */}
      <div style={contentWrapperStyle}>
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: isMobile ? '16px' : '32px',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          justifyContent: 'center',
          padding: isMobile ? '0' : '0'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                buttonText={feature.buttonText}
                onButtonClick={feature.onButtonClick}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}; 