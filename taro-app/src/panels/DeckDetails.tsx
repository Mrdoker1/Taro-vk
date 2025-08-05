import { FC, useEffect } from 'react';
import {
  Panel,
  Div,
  NavIdProps,
  Text,
  Placeholder,
  Skeleton,
  Button,
  ConfigProvider,
} from '@vkontakte/vkui';
import { useParams } from '@vkontakte/vk-mini-apps-router';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';
import { DEFAULT_VIEW_PANELS } from '../routes';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDeckDetails, clearCurrentDeck } from '../store/slices/taroDecksSlice';
import '../styles/deck-details.css';

export interface DeckDetailsProps extends NavIdProps {}

export const DeckDetails: FC<DeckDetailsProps> = ({ id }) => {
  const params = useParams() || {};
  const deckId = params.deckId as string;
  const routeNavigator = useRouteNavigator();
  const dispatch = useAppDispatch();
  const { currentDeck, deckLoading, deckError } = useAppSelector((state) => state.taroDecks);
  const { lang } = useAppSelector((state) => state.horoscope);

  useEffect(() => {
    if (deckId) {
      dispatch(fetchDeckDetails({ deckId, lang }));
    }

    return () => {
      dispatch(clearCurrentDeck());
    };
  }, [dispatch, deckId, lang]);

  const handleCardClick = (cardId: string) => {
    routeNavigator.push(`/deck/${deckId}/card/${cardId}`);
  };

  const handleAboutApp = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT_APP}`);
  };

  const handleLegalInfo = () => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.LEGAL_INFO}`);
  };

  // Компонент скелетона для отображения во время загрузки
  const DeckDetailsSkeleton = () => (
    <Div style={{ 
      padding: '20px 12px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        padding: '32px'
      }} className="deck-details">
        {/* Скелетон для информации о колоде */}
        <div 
          className="deck-info-container"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <Skeleton width={120} height={180} borderRadius={12} />
          <div className="deck-info-content" style={{ flex: 1 }}>
            <Skeleton width="70%" height={32} style={{ marginBottom: '12px' }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
            <Skeleton width="40%" height={16} />
          </div>
        </div>
        
        {/* Декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Skeleton width={90} height={20} borderRadius={8} />
        </div>

        {/* Разделитель */}
        <div style={{
          width: '100%',
          height: '2px',
          marginBottom: '32px'
        }}>
          <Skeleton width="100%" height={2} />
        </div>

        {/* Заголовок секции */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Skeleton width="200px" height={24} />
        </div>

        {/* Сетка карт */}
        <div className="cards-grid">
          {Array(4).fill(null).map((_, index) => (
            <div key={index} className="card-item">
              <div className="card-content">
                <Skeleton width={70} height={100} borderRadius={8} />
                <div className="card-info">
                  <Skeleton width="80%" height={20} style={{ marginBottom: '8px' }} />
                  <Skeleton width="100%" height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Нижний разделитель */}
        <div style={{
          width: '100%',
          height: '2px',
          marginBottom: '16px'
        }}>
          <Skeleton width="100%" height={2} />
        </div>

        {/* Нижний декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Skeleton width={90} height={20} borderRadius={8} />
        </div>
      </div>
    </Div>
  );

  return (
    <ConfigProvider hasCustomPanelHeaderAfter={false}>
      <Panel id={id}>
      <AppHeader
        left={
          <Button
            mode="tertiary"
            onClick={() => routeNavigator.back()}
          >
            Назад
          </Button>
        }
        right={<StarButton size="s" />}
      />

      {deckLoading && <DeckDetailsSkeleton />}
      
      {deckError && (
        <Placeholder>
          <Text style={{ color: 'red' }}>{deckError}</Text>
        </Placeholder>
      )}
      
      {!deckLoading && !deckError && currentDeck && (
        <Div style={{ 
          padding: '20px 12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div className="deck-details" style={{
            width: '100%',
            background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            padding: '32px'
          }}>
            {/* Информация о колоде */}
            <div 
              className="deck-info-container"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '32px'
              }}
            >
              {currentDeck.coverImageUrl && (
                <img
                  src={currentDeck.coverImageUrl}
                  alt={currentDeck.name}
                  style={{
                    width: '120px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    flexShrink: 0
                  }}
                />
              )}
              <div className="deck-info-content" style={{ flex: 1 }}>
                <h1 style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0 0 12px 0',
                  fontFamily: 'Jost',
                  lineHeight: 1.2
                }}>
                  {currentDeck.name}
                </h1>
                <p style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                  opacity: 0.9
                }}>
                  {currentDeck.description}
                </p>
                <p style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  margin: 0,
                  opacity: 0.8
                }}>
                  Всего карт: {currentDeck.cardsCount}
                </p>
              </div>
            </div>

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

            {/* Заголовок секции карт */}
            <h2 style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '400',
              margin: '0 0 24px 0',
              fontFamily: 'Jost',
              textAlign: 'center'
            }}>
              Карты колоды
            </h2>

            {/* Сетка карт */}
            {currentDeck.cards && currentDeck.cards.length > 0 ? (
              <div className="cards-grid">
                {currentDeck.cards.map(card => (
                  <div
                    key={card.id}
                    className="card-item"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="card-content">
                      {card.imageUrl && (
                        <img 
                          src={card.imageUrl}
                          alt={card.name}
                          className="card-image"
                        />
                      )}
                      <div className="card-info">
                        <h3 className="card-title">
                          {card.name}
                        </h3>
                        <p className="card-meaning">
                          {card.meaning.upright}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                color: '#ffffff',
                textAlign: 'center',
                padding: '40px 20px',
                opacity: 0.8
              }}>
                Список карт недоступен
              </div>
            )}

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
      )}
      
      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
    </ConfigProvider>
  );
}; 