import { FC, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Div,
  NavIdProps,
  Text,
  Group,
  Title,
  Placeholder,
  SimpleCell,
  Skeleton,
} from '@vkontakte/vkui';
import { useParams } from '@vkontakte/vk-mini-apps-router';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCardDetails, clearCurrentCard } from '../store/slices/taroDecksSlice';

export interface CardDetailsProps extends NavIdProps {}

export const CardDetails: FC<CardDetailsProps> = ({ id }) => {
  const params = useParams() || {};
  const { deckId, cardId } = params;
  const routeNavigator = useRouteNavigator();
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

  // Компонент скелетона для отображения во время загрузки
  const CardDetailsSkeleton = () => (
    <Div>
      <Group>
        <Div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px',
          gap: '24px'
        }}>
          <SimpleCell 
            disabled 
            style={{ padding: 0 }}
            subtitle={<Skeleton width={120} height={16} />}
          >
            <Skeleton width={150} height={32} style={{ margin: '0 auto' }} />
          </SimpleCell>
          
          <Skeleton width={200} height={300} borderRadius={12} />
          
          <Group header={<Title level="3">Значение карты</Title>} style={{ width: '100%' }}>
            <SimpleCell 
              multiline 
              disabled
              indicator={<Skeleton width={180} height={36} />}
            >
              В прямом положении
            </SimpleCell>
            <SimpleCell 
              multiline 
              disabled
              indicator={<Skeleton width={180} height={36} />}
            >
              В перевернутом положении
            </SimpleCell>
          </Group>
          
          <Group header={<Title level="3">О колоде</Title>} style={{ width: '100%' }}>
            <Div>
              <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
              <Skeleton width="100%" height={16} style={{ marginBottom: '8px' }} />
              <Skeleton width="80%" height={16} style={{ marginBottom: '8px' }} />
            </Div>
          </Group>
        </Div>
      </Group>
    </Div>
  );

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}
      >
        {currentCard?.card.name || 'Детали карты'}
      </PanelHeader>

      {cardLoading && <CardDetailsSkeleton />}
      
      {cardError && (
        <Placeholder>
          <Text style={{ color: 'red' }}>{cardError}</Text>
        </Placeholder>
      )}
      
      {!cardLoading && !cardError && currentCard && (
        <Div>
          <Group>
            <Div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px',
              gap: '24px'
            }}>
              <SimpleCell 
                disabled 
                style={{ padding: 0 }}
                subtitle={currentCard.deck.name}
              >
                <Title level="1" style={{ textAlign: 'center' }}>{currentCard.card.name}</Title>
              </SimpleCell>
              
              {currentCard.card.imageUrl && (
                <img
                  src={currentCard.card.imageUrl}
                  alt={currentCard.card.name}
                  style={{
                    width: '200px',
                    height: '300px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                  }}
                />
              )}
              
              <Group header={<Title level="3">Значение карты</Title>} style={{ width: '100%' }}>
                <SimpleCell multiline indicator={currentCard.card.meaning.upright}>
                  В прямом положении
                </SimpleCell>
                <SimpleCell multiline indicator={currentCard.card.meaning.reversed}>
                  В перевернутом положении
                </SimpleCell>
              </Group>
              
              <Group header={<Title level="3">О колоде</Title>} style={{ width: '100%' }}>
                <Div>
                  <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    {currentCard.deck.description}
                  </Text>
                </Div>
              </Group>
            </Div>
          </Group>
        </Div>
      )}
    </Panel>
  );
}; 