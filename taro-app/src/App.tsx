import { useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation, useParams } from '@vkontakte/vk-mini-apps-router';
import { Provider } from 'react-redux';

import { Persik, Home, NewPage, Settings, DeckDetails, CardDetails, TaroSpreads, TaroReadingPanel, DailyAffirmationPanel } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';
import bridge from './bridge';
import { store } from './store';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const params = useParams();
  const spreadId = params?.spreadId || '';
  const deckId = params?.deckId || '';
  const [fetchedUser, setUser] = useState<UserInfo | undefined>();
  const [popout, setPopout] = useState<ReactNode | null>(<ScreenSpinner />);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Начинаем получение данных пользователя...');
        const user = await bridge.send('VKWebAppGetUserInfo');
        console.log('Получены данные пользователя:', user);
        setUser(user);
        setPopout(null);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setPopout(null);
      }
    }
    fetchData();
  }, []);

  return (
    <Provider store={store}>
      <SplitLayout>
        <SplitCol>
          <View activePanel={activePanel}>
            <Home id={DEFAULT_VIEW_PANELS.HOME} fetchedUser={fetchedUser} />
            <Persik id={DEFAULT_VIEW_PANELS.PERSIK} />
            <NewPage id={DEFAULT_VIEW_PANELS.NEW_PAGE} />
            <Settings id={DEFAULT_VIEW_PANELS.SETTINGS} />
            <DeckDetails id={DEFAULT_VIEW_PANELS.DECK_DETAILS} />
            <CardDetails id={DEFAULT_VIEW_PANELS.CARD_DETAILS} />
            <TaroSpreads id={DEFAULT_VIEW_PANELS.TARO_SPREADS} />
            <TaroReadingPanel 
              id={DEFAULT_VIEW_PANELS.TARO_READING} 
              spreadId={spreadId} 
              deckId={deckId} 
            />
            <DailyAffirmationPanel id={DEFAULT_VIEW_PANELS.DAILY_AFFIRMATION} />
          </View>
        </SplitCol>
        {popout}
      </SplitLayout>
    </Provider>
  );
};
