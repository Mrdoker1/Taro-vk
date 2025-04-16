import { useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { Persik, Home } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';
import bridge from './bridge';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
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
    <SplitLayout>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home id="home" fetchedUser={fetchedUser} />
          <Persik id="persik" />
        </View>
      </SplitCol>
      {popout}
    </SplitLayout>
  );
};
