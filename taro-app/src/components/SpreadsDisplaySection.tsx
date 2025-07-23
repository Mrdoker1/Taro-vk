import React from 'react';
import { CustomButton } from './CustomButton';
import { MagicLoader } from './MagicLoader';
import { useAppSelector } from '../store';
import { TaroSpread } from '../store/slices/taroSpreadsSlice';

// Кастомный хук для адаптивности
const useResponsive = () => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < 768,
    isSmallMobile: windowWidth < 480,
    isVerySmallMobile: windowWidth < 400,
    windowWidth
  };
};

// Константы для стилей
const BORDER_COLOR = 'rgba(227, 199, 122, 0.15)';
const TEXT_COLOR = 'white';
const FONT_FAMILY = 'Jost';

interface SpreadCardProps {
  spread: TaroSpread;
  onSelectSpread: (spreadId: string) => void;
}

const SpreadCard: React.FC<SpreadCardProps> = ({ spread, onSelectSpread }) => {
  const { isMobile, isSmallMobile } = useResponsive();

  // Функция для получения изображения по названию расклада
  const getSpreadImage = (spreadName: string) => {
    switch (spreadName.toLowerCase()) {
      case 'три карты':
        return 'https://i.ibb.co/twLp8jP5/Image-2.png';
      case 'ло шу':
        return 'https://i.ibb.co/prbNMpfq/Image.png';
      default:
        return 'https://i.ibb.co/sJNzV60L/Image.png';
    }
  };

  // Объединенные базовые стили
  const baseCardStyle: React.CSSProperties = {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: '4px',
    display: 'flex',
    width: '100%',
    minWidth: isMobile ? '280px' : '380px',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    padding: '9px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  const imageStyle: React.CSSProperties = {
    minWidth: isSmallMobile ? '130px' : (isMobile ? '150px' : '180px'),
    minHeight: isSmallMobile ? '170px' : (isMobile ? '180px' : '200px'),
    width: isSmallMobile ? '130px' : (isMobile ? '150px' : '180px'),
    height: isSmallMobile ? '170px' : (isMobile ? '180px' : '200px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: isMobile ? '12px' : '16px',
    minWidth: 0,
    justifyContent: 'space-between'
  };

  const textStyles: React.CSSProperties = {
    flex: 1,
    marginBottom: isMobile ? '12px' : '16px'
  };

  return (
    <div style={baseCardStyle}>
      {/* Внутренняя обводка */}
      <div style={{
        border: `1px solid ${BORDER_COLOR}`,
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: isMobile ? '16px' : '16px',
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }}>
        {/* Изображение расклада */}
        <div style={imageStyle}>
          <img
            src={getSpreadImage(spread.name)}
            alt={`${spread.name} layout`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Контент */}
        <div style={contentStyle}>
          {/* Информация о раскладе */}
          <div style={textStyles}>
            <h3 style={{
              fontSize: isSmallMobile ? '20px' : '24px',
              lineHeight: 1,
              margin: '0 0 4px 0',
              fontWeight: 500,
              color: TEXT_COLOR,
              fontFamily: FONT_FAMILY,
              textAlign: 'left',
              marginBottom: '12px',
            }}>
              {spread.name}
            </h3>
            <p style={{
              fontSize: isSmallMobile ? '14px' : '14px',
              lineHeight: 1.2,
              margin: '0 0 8px 0',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: FONT_FAMILY,
              textAlign: 'left'
            }}>
              {spread.description}
            </p>
            {spread.paid && (
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: 'rgba(227, 199, 122, 0.2)',
                color: 'rgba(227, 199, 122, 1)',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '3px',
                fontFamily: FONT_FAMILY,
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                ⭐ Платный
              </span>
            )}
          </div>

          {/* Кнопка выбора */}
          <CustomButton
            onClick={() => onSelectSpread(spread.id)}
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '200px',
              fontSize: isSmallMobile ? '11px' : '12px'
            }}
          >
            Выбрать
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

interface SpreadsDisplaySectionProps {
  onSelectSpread: (spreadId: string) => void;
}

export const SpreadsDisplaySection: React.FC<SpreadsDisplaySectionProps> = ({ onSelectSpread }) => {
  const { spreads, spreadsLoading, spreadsError } = useAppSelector((state) => state.taroSpreads);
  const { isMobile, isVerySmallMobile } = useResponsive();

  // Стили секции
  const sectionStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    margin: '0 auto',
    padding: isMobile ? '16px' : '32px',
    backgroundColor: 'transparent',
    minHeight: '400px',
    boxSizing: 'border-box'
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/4474e821ca04dad4095886f421bf03283092dfc5')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '12px'
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
    flexWrap: 'wrap',
    marginBottom: '24px'
  };

  const iconStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    objectFit: 'contain',
    flexShrink: 0,
    aspectRatio: '1'
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

  if (spreadsLoading) {
    return (
      <section style={sectionStyle}>
        <div style={backgroundStyle} />
        
        {/* Заголовок секции */}
        <div style={headerStyle}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/cf86979ebd7f8f29d083fff45b7dbbc96221b5a9"
            alt="Tarot spreads icon"
            style={iconStyle}
          />
          <h2 style={titleStyle}>
            Доступные расклады
          </h2>
        </div>

        {/* Декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative'
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

        <div style={contentWrapperStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <MagicLoader text="Загружаем расклады..." />
          </div>
        </div>
      </section>
    );
  }

  if (spreadsError) {
    return (
      <section style={sectionStyle}>
        <div style={backgroundStyle} />
        
        {/* Заголовок секции */}
        <div style={headerStyle}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/cf86979ebd7f8f29d083fff45b7dbbc96221b5a9"
            alt="Tarot spreads icon"
            style={iconStyle}
          />
          <h2 style={titleStyle}>
            Доступные расклады
          </h2>
        </div>

        {/* Декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative'
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

        <div style={contentWrapperStyle}>
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            fontFamily: FONT_FAMILY,
            padding: '40px 20px'
          }}>
            Ошибка загрузки раскладов: {spreadsError}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      {/* Фоновое изображение */}
      <div style={backgroundStyle} />
      
      {/* Заголовок секции */}
      <div style={headerStyle}>
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/cf86979ebd7f8f29d083fff45b7dbbc96221b5a9"
          alt="Tarot spreads icon"
          style={iconStyle}
        />
        <h2 style={titleStyle}>
          Доступные расклады
        </h2>
      </div>
      
      {/* Декоративный элемент */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
        position: 'relative'
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

      {/* Контент секции */}
      <div style={contentWrapperStyle}>
        {spreads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            fontFamily: FONT_FAMILY,
            padding: '40px 20px'
          }}>
            Расклады не найдены
          </div>
        ) : (
          <div style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: isMobile ? '16px' : '20px',
            width: '100%',
            margin: '0 auto',
            minWidth: isMobile ? '280px' : 'auto'
          }}>
            {spreads.map((spread) => (
              <SpreadCard
                key={spread.id}
                spread={spread}
                onSelectSpread={onSelectSpread}
              />
            ))}
          </div>
        )}

        {/* Нижний декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          marginTop: '16px',
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
    </section>
  );
};
