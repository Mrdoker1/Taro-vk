import { FC, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Div,
  NavIdProps,
  Text,
  Group,
  CardGrid,
  Title,
  Placeholder,
  Card,
  Skeleton,
} from '@vkontakte/vkui';
import { useParams } from '@vkontakte/vk-mini-apps-router';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDeckDetails, clearCurrentDeck } from '../store/slices/taroDecksSlice';

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

  // Компонент скелетона для отображения во время загрузки
  const DeckDetailsSkeleton = () => (
    <Div>
      <Group>
        <Div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '16px', 
          padding: '16px',
          marginBottom: '24px'
        }}>
          <Skeleton width={100} height={150} borderRadius={12} />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height={32} style={{ marginBottom: '12px' }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
            <Skeleton width="40%" height={16} style={{ marginTop: '12px' }} />
          </div>
        </Div>
        
        <Group header={<Title level="3" style={{ padding: '0 16px' }}>Карты колоды</Title>}>
          <CardGrid size="s" style={{ padding: '0 12px' }}>
            {Array(4).fill(null).map((_, index) => (
              <Card key={index} mode="shadow">
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Skeleton width={70} height={100} borderRadius={8} />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="80%" height={24} style={{ marginBottom: '8px' }} />
                      <Skeleton width="100%" height={14} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardGrid>
        </Group>
      </Group>
    </Div>
  );

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}
      >
        {currentDeck?.name || 'Детали колоды'}
      </PanelHeader>

      {deckLoading && <DeckDetailsSkeleton />}
      
      {deckError && (
        <Placeholder>
          <Text style={{ color: 'red' }}>{deckError}</Text>
        </Placeholder>
      )}
      
      {!deckLoading && !deckError && currentDeck && (
        <Div>
          <Group>
            <Div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '16px', 
              padding: '16px',
              marginBottom: '24px'
            }}>
              {currentDeck.coverImageUrl && (
                <img
                  src={currentDeck.coverImageUrl}
                  alt={currentDeck.name}
                  style={{
                    width: '100px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              )}
              <div>
                <Title level="1" style={{ marginBottom: '12px' }}>{currentDeck.name}</Title>
                <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>{currentDeck.description}</Text>
                <Text style={{ 
                  marginTop: '12px',
                  color: 'var(--vkui--color_text_secondary)'
                }}>
                  Всего карт: {currentDeck.cardsCount}
                </Text>
              </div>
            </Div>
            
            <Group header={<Title level="3" style={{ padding: '0 16px' }}>Карты колоды</Title>}>
              {currentDeck.cards && currentDeck.cards.length > 0 ? (
                <CardGrid size="s" style={{ padding: '0 12px' }}>
                  {currentDeck.cards.map(card => (
                    <Card key={card.id} mode="shadow" onClick={() => handleCardClick(card.id)}>
                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          {card.imageUrl && (
                            <img 
                              src={card.imageUrl}
                              alt={card.name}
                              style={{
                                width: '70px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          )}
                          <div>
                            <Title level="3" style={{ marginBottom: '8px' }}>{card.name}</Title>
                            <Text style={{ 
                              fontSize: '14px', 
                              color: 'var(--vkui--color_text_secondary)'
                            }}>
                              {card.meaning.upright}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardGrid>
              ) : (
                <Placeholder>Список карт недоступен</Placeholder>
              )}
            </Group>
          </Group>
        </Div>
      )}
    </Panel>
  );
}; 