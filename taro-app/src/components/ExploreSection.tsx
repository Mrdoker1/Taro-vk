import React from 'react';
import { CustomTooltip } from './CustomTooltip';
import { CustomButton } from './CustomButton';
import exploreAImage from '../assets/expore-a.png';
import exploreBImage from '../assets/explore-b.png';
import exploreCImage from '../assets/explore-c.png';

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
  return (
    <div style={{
      border: '1px solid rgba(227, 199, 122, 0.15)',
      borderRadius: '500px 500px 4px 4px',
      padding: '8px',
      flex: '1',
      minWidth: '240px',
      maxWidth: '320px',
      backgroundColor: 'transparent'
    }}>
      <div style={{
        border: '1px solid rgba(227, 199, 122, 0.15)',
        borderRadius: '500px 500px 0px 0px',
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }}>
        {/* Верхняя часть с изображением */}
        <div style={{
          position: 'relative',
          aspectRatio: '1.663'
        }}>
          {/* Изображение карточки */}
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
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
          
          {/* Тултип в правом нижнем углу */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px'
          }}>
            <CustomTooltip
              content={
                title === 'Гадание на картах Таро' ? 
                  'Выберите расклад карт Таро для получения предсказания и ответов на ваши вопросы' :
                 title === 'Аффирмации' ?
                  'Получите позитивные утверждения для настройки на успешный день и привлечения желаемого' :
                  'Ведите духовный дневник, отслеживайте расклады и аффирмации для своего развития'
              }
              ariaLabel={`Показать справку о разделе ${title}`}
            />
          </div>
        </div>
        
        {/* Нижняя часть с контентом */}
        <div style={{
          padding: '32px 14px',
          textAlign: 'center',
          backgroundColor: 'transparent'
        }}>
          <div style={{
            maxWidth: '283px',
            margin: '0 auto'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '500',
              lineHeight: '1.4',
              margin: '0 0 12px 0',
              color: 'white'
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: '16px',
              fontWeight: '300',
              lineHeight: '1.3',
              margin: '0 0 24px 0',
              color: 'white'
            }}>
              {description}
            </p>
          </div>
          
          <CustomButton
            variant="secondary"
            size="m"
            onClick={onButtonClick}
            style={{
              width: '100%',
              maxWidth: '280px'
            }}
          >
            {buttonText}
          </CustomButton>
        </div>
      </div>
    </div>
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
    backgroundImage: "url('https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/09daade4c7f3187726b9c9353ab3805f617b6cbd?placeholderIfAbsent=true')",
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
    fontSize: 'clamp(16px, 4vw, 24px)',
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
      description: "Выберите один из доступных раскладов и получите предсказание на интересующий вас вопрос.",
      buttonText: "Выбрать расклад",
      onButtonClick: onOpenSpreads
    },
    {
      title: "Аффирмации",
      description: "Позитивные утверждения помогут вам настроиться на успешный день и привлечь желаемое в свою жизнь.",
      buttonText: "Получить аффирмации",
      onButtonClick: onOpenAffirmations
    },
    {
      title: "Ваш духовный дневник",
      description: "Отслеживайте свои расклады Таро, аффирмации и ведите заметки о своем духовном развитии.",
      buttonText: "Открыть календарь",
      onButtonClick: onOpenCalendar
    }
  ];

  return (
    <section style={sectionStyle}>
      {/* Фоновое изображение */}
      <div style={backgroundStyle} />
      
      {/* Заголовок секции */}
      <div style={headerStyle}>
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/8fe9fd736d65fcb16451a2d349310471db362c0c?placeholderIfAbsent=true"
          alt="Explore icon"
          style={iconStyle}
        />
        <h2 style={titleStyle}>
          Исследуй Таро
        </h2>
      </div>
      
      {/* Контент секции */}
      <div style={contentWrapperStyle}>
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              buttonText={feature.buttonText}
              onButtonClick={feature.onButtonClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 