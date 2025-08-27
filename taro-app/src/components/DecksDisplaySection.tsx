import React from 'react';
import { CustomButton } from './CustomButton';
import { CustomTooltip } from './CustomTooltip';
import { MagicLoader } from './MagicLoader';
import { useAppSelector, useAppDispatch } from '../store';
import { TaroDeck, fetchDecks } from '../store/slices/taroDecksSlice';
import { BACKGROUND_BASE } from '../constants/styles';
import noImagePlaceholder from '../assets/no-image.png';
import decksIcon from '../assets/decks.svg';

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
    windowWidth
  };
};

// Константы для стилей
const BORDER_COLOR = 'rgba(227, 199, 122, 0.15)';
const TEXT_COLOR = 'white';
const FONT_FAMILY = 'Jost';

interface DeckCardProps {
  deck: TaroDeck;
  onViewDetails: (deckId: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = React.memo(({ deck, onViewDetails }) => {
  const { isMobile, isSmallMobile } = useResponsive();

  // Объединенные базовые стили
  const baseCardStyle: React.CSSProperties = {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: '4px',
    display: 'flex',
    minHeight: isSmallMobile ? '160px' : '180px',
    width: '100%',
    alignItems: 'center',
    gap: isMobile ? '8px' : '16px',
    marginTop: '16px',
    padding: isMobile ? '6px' : '8px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box'
  };

  const imageStyle: React.CSSProperties = {
    minWidth: isSmallMobile ? '150px' : '200px',
    minHeight: isSmallMobile ? '155px' : '200px',
    width: isSmallMobile ? '150px' : '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: isMobile ? '12px' : '24px',
    flex: 1,
    padding: isMobile ? '12px' : '32px',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    overflow: 'hidden'
  };

  const textStyles: React.CSSProperties = {
    minWidth: 0,
    color: TEXT_COLOR,
    fontWeight: 400,
    flex: 1,
    fontFamily: FONT_FAMILY,
    overflow: 'hidden'
  };

  return (
    <div style={baseCardStyle}>
      {/* Внутренняя обводка */}
      <div style={{
        border: `1px solid ${BORDER_COLOR}`,
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: isMobile ? '8px' : '16px',
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }}>
        {/* Изображение колоды */}
        <div style={imageStyle}>
          {/* Фоновое изображение рубашки карт */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/c43877d5214be87b04d15e5db077b57a425cb777?placeholderIfAbsent=true')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1
          }} />
          
          {/* Изображение обложки колоды */}
          <img
            src={deck.coverImageUrl || noImagePlaceholder}
            alt={`${deck.name} deck`}
            style={{
              width: isSmallMobile ? '130px' : '180px',
              height: isSmallMobile ? '135px' : '180px',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              margin: 'auto'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.warn('Ошибка загрузки изображения колоды:', target.src);
              target.src = noImagePlaceholder;
            }}
          />
        </div>
        
        {/* Контент */}
        <div style={contentStyle}>
          <div style={textStyles}>
            <h3 style={{
              color: TEXT_COLOR,
              fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
              fontWeight: 500,
              lineHeight: 1.2,
              margin: '0 0 12px 0',
              fontFamily: FONT_FAMILY
            }}>
              {deck.name}
            </h3>
            <p style={{
              margin: '0 0 12px 0',
              lineHeight: 1.3,
              fontSize: isSmallMobile ? '14px' : isMobile ? '15px' : '16px',
              fontFamily: FONT_FAMILY
            }}>
              {deck.description}
            </p>
            <div style={{
              margin: 0,
              fontWeight: 200,
              fontSize: isSmallMobile ? '12px' : isMobile ? '13px' : '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: FONT_FAMILY
            }}>
              Карт в колоде: {deck.cardsCount}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: isMobile ? '100%' : '217px',
            marginTop: isMobile ? '12px' : '0',
            flexShrink: 0
          }}>
            <CustomButton
              variant="secondary"
              size="m"
              mobileSize="xs"
              onClick={() => onViewDetails(deck.id)}
              disabled={!deck.available}
              style={{
                width: '100%',
                maxWidth: isMobile ? '160px' : '217px'
              }}
            >
              Подробнее
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
});

interface DecksDisplaySectionProps {
  onViewDeckDetails: (deckId: string) => void;
}

export const DecksDisplaySection: React.FC<DecksDisplaySectionProps> = React.memo(({ onViewDeckDetails }) => {
  const dispatch = useAppDispatch();
  const { decks, decksLoading, decksError } = useAppSelector((state) => state.taroDecks);
  const { isMobile, isSmallMobile } = useResponsive();

  const handleReloadDecks = () => {
    dispatch(fetchDecks({ lang: 'russian' }));
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    position: 'relative',
    minHeight: 'auto',
    width: '100%',
    overflow: 'hidden',
    padding: isSmallMobile ? '12px' : isMobile ? '16px' : '32px',
    marginTop: '12px',
    boxSizing: 'border-box',
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
    color: TEXT_COLOR,
    fontWeight: 500,
    lineHeight: 1.2,
    flexWrap: 'wrap',
    marginBottom: '8px'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  // Упрощенная логика состояний
  const renderContent = () => {
    if (decksLoading) {
      return <MagicLoader text="Подготавливаем колоды..." size="m" />;
    }

    if (decksError) {
      return (
        <div style={{
          ...contentStyle,
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            fontSize: isSmallMobile ? '14px' : '16px',
            fontFamily: FONT_FAMILY,
            color: '#ffffff',
            marginBottom: '16px',
            opacity: 0.9
          }}>
            Не удалось загрузить колоды
          </div>
          <button
            onClick={handleReloadDecks}
            disabled={decksLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(227, 199, 122, 0.2)',
              border: '1px solid rgba(227, 199, 122, 0.4)',
              borderRadius: '8px',
              color: '#e3c77a',
              fontFamily: 'Jost, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              cursor: decksLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: decksLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              if (!decksLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(227, 199, 122, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(227, 199, 122, 0.2)';
            }}
          >
            {decksLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #e3c77a',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Загрузка...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20V15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 9M3.51 15A9 9 0 0 0 18.36 18.36L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Обновить
              </>
            )}
          </button>
        </div>
      );
    }

    if (!decks || decks.length === 0) {
      return <div style={{ ...contentStyle, justifyContent: 'center', alignItems: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: isSmallMobile ? '14px' : '16px', fontFamily: FONT_FAMILY, textAlign: 'center' }}>
        Колоды не найдены
      </div>;
    }

    return (
      <div style={contentStyle}>
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onViewDetails={onViewDeckDetails}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <section style={sectionStyle}>
      {/* Заголовок секции */}
      <div style={headerStyle}>
        <img
          src={decksIcon}
          alt="Deck icon"
          style={{
            width: '44px',
            height: '44px',
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
        <h2 style={{
          flex: 1,
          minWidth: 0,
          fontFamily: FONT_FAMILY,
          fontWeight: 400,
          fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
          lineHeight: 1.2,
          margin: 0
        }}>
          Твои колоды {decks && decks.length > 0 ? `(${decks.length})` : decksLoading ? '' : '(0)'}
        </h2>
        <div style={{ position: 'relative' }}>
          <CustomTooltip
            content="Здесь отображаются доступные колоды Таро. Выбери колоду для просмотра подробной информации о картах."
            ariaLabel="Показать справку о разделе Твои колоды"
          />
        </div>
      </div>
      
      {/* Контент секции */}
      {renderContent()}
    </section>
    </>
  );
});
