import { FC, useEffect } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  Text,
  Placeholder,
  Button,
  ConfigProvider,
} from '@vkontakte/vkui';
import { useParams } from '@vkontakte/vk-mini-apps-router';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useSafeNavigation } from '../utils/routerNavigation';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';
import { MagicLoader } from '../components/MagicLoader';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCardDetails, clearCurrentCard } from '../store/slices/taroDecksSlice';
import '../styles/card-details.css';
import { BACKGROUND_BASE } from '../constants/styles';

export interface CardDetailsProps extends NavIdProps {}

export const CardDetails: FC<CardDetailsProps> = ({ id }) => {
  const params = useParams() || {};
  const { deckId, cardId } = params;
  const routeNavigator = useRouteNavigator();
  const { safeBack } = useSafeNavigation();
  const dispatch = useAppDispatch();
  const { currentCard, cardLoading, cardError } = useAppSelector((state) => state.taroDecks);
  const { lang } = useAppSelector((state) => state.horoscope);

  useEffect(() => {
    if (deckId && cardId) {
      dispatch(fetchCardDetails({ deckId, cardId, lang }));
    }

    return () => {
      dispatch(clearCurrentCard());
    };
  }, [dispatch, deckId, cardId, lang]);

  const handleAboutApp = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  };

  const handleLegalInfo = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  };

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
        <AppHeader
          left={
            <Button
              mode="tertiary"
              onClick={() => safeBack()}
              style={{ 
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              Назад
            </Button>
          }
        />

        {cardLoading && (
          <Div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
            <MagicLoader />
          </Div>
        )}
        
        {cardError && (
          <Placeholder>
            <Text style={{ color: 'red' }}>{cardError}</Text>
          </Placeholder>
        )}
        
        {!cardLoading && !cardError && currentCard && (
          <Div style={{ 
            padding: '0 12px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div className="card-details" style={{
              width: '100%',
              ...BACKGROUND_BASE,
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              padding: '32px'
            }}>
              {/* Открывающий декоративный элемент */}
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
                marginBottom: '32px'
              }} />

              {/* Основной контент */}
              <div className="card-details-container">
                {/* Секция изображения карты */}
                <div className="card-image-section">
                  {currentCard.card.imageUrl && (
                    <img
                      src={currentCard.card.imageUrl}
                      alt={currentCard.card.name}
                      className="card-image"
                    />
                  )}
                  <div className="card-title-section">
                    <h1 className="card-title">{currentCard.card.name}</h1>
                    <p className="card-deck-name">{currentCard.deck.name}</p>
                  </div>
                </div>

                {/* Секция информации о карте */}
                <div className="card-info-section">
                  {/* Значение карты */}
                  <div className="card-meaning-section">
                    <div className="meaning-item">
                      <div className="meaning-label">
                        В прямом положении
                      </div>
                      <p className="meaning-text">
                        {currentCard.card.meaning.upright}
                      </p>
                    </div>

                    <div className="meaning-item">
                      <div className="meaning-label">
                        <span className="reversed-icon">↓</span>
                        В перевернутом положении
                      </div>
                      <p className="meaning-text">
                        {currentCard.card.meaning.reversed}
                      </p>
                    </div>
                  </div>

                  {/* О колоде */}
                  <div>
                    <h2 className="section-title">О колоде</h2>
                    <p className="deck-description">
                      {currentCard.deck.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Нижний разделитель */}
              <div style={{
                width: '100%',
                height: '1px',
                background: 'rgba(232, 210, 140, 0.15)',
                marginTop: '32px',
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
        )}
        
        <Footer 
          onAboutApp={handleAboutApp}
          onLegalInfo={handleLegalInfo}
        />
      </Panel>
    </ConfigProvider>
  );
}; 