import { useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation, useParams } from '@vkontakte/vk-mini-apps-router';
import { Provider } from 'react-redux';

import { Persik, Home, NewPage, Settings, DeckDetails, CardDetails, TaroSpreads, TaroReadingPanel, DailyAffirmationPanel, CalendarPanel, AboutApp, LegalInfo, StarsPurchase, CollectionPins, Profile } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';
import bridge from './bridge';
import { store } from './store';
import { loadUserQuestion } from './store/slices/appSlice';
import { initializePins } from './store/slices/pinsSlice';
import { initializeStars } from './store/slices/starsSlice';
import { applyTheme } from './constants/styles';
import { AppWrapper } from './components/AppWrapper';
import { PinNotificationPopup } from './components/PinNotificationPopup';
import { PurchaseStarsPopup } from './components/PurchaseStarsPopup';

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
        
        // Загружаем сохраненный вопрос пользователя
        console.log('Загружаем сохраненный вопрос пользователя...');
        store.dispatch(loadUserQuestion());
        
        // Инициализируем пины
        console.log('Инициализируем пины...');
        store.dispatch(initializePins());
        
        // Инициализируем звёзды
        console.log('Инициализируем звёзды...');
        store.dispatch(initializeStars());
        
        // Применяем сохраненную тему
        const currentTheme = store.getState().app.theme;
        applyTheme(currentTheme);
        
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
      <AppWrapper>
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
              <CalendarPanel id={DEFAULT_VIEW_PANELS.CALENDAR} />
              <AboutApp id={DEFAULT_VIEW_PANELS.ABOUT_APP} />
              <LegalInfo id={DEFAULT_VIEW_PANELS.LEGAL_INFO} />
              <StarsPurchase id={DEFAULT_VIEW_PANELS.STARS_PURCHASE} />
              <CollectionPins id={DEFAULT_VIEW_PANELS.COLLECTION_PINS} />
              <Profile id={DEFAULT_VIEW_PANELS.PROFILE} fetchedUser={fetchedUser} />
            </View>
          </SplitCol>
          {popout}
        </SplitLayout>
        
        {/* Глобальный попап для уведомлений о пинах */}
        <PinNotificationPopup />
        
        {/* Глобальный попап для покупки звёзд */}
        <PurchaseStarsPopup 
          activeModal={null} 
          onClose={() => {}} 
        />
      </AppWrapper>
    </Provider>
  );
};
