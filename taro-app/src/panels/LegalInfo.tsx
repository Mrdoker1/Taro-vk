import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  PanelHeader,
  PanelHeaderBack,
  Div,
  Group,
  Text,
  Title
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Footer } from '../components/Footer';

export interface LegalInfoProps extends NavIdProps {}

export const LegalInfo: FC<LegalInfoProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    routeNavigator.back();
  };

  const handleAboutApp = () => {
    routeNavigator.push('/about-app');
  };

  const handleLegalInfo = () => {
    // Уже на странице "Правовая информация"
  };

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={handleBackClick} />}
      >
        Правовая информация
      </PanelHeader>
      
      <Div style={{ padding: '0 12px' }}>
        <Group>
          <Div style={{ padding: '16px' }}>
            <Title level="3" style={{ marginBottom: '16px' }}>
              Пользовательское соглашение
            </Title>
            <Text style={{ marginBottom: '16px' }}>
              Используя данное приложение, вы соглашаетесь с условиями использования.
            </Text>
            
            <Title level="3" style={{ marginBottom: '16px' }}>
              Политика конфиденциальности
            </Title>
            <Text style={{ marginBottom: '16px' }}>
              Мы уважаем вашу конфиденциальность и защищаем ваши персональные данные.
            </Text>
            
            <Title level="3" style={{ marginBottom: '16px' }}>
              Отказ от ответственности
            </Title>
            <Text>
              Гадания и предсказания носят развлекательный характер и не должны 
              использоваться для принятия серьёзных жизненных решений.
            </Text>
          </Div>
        </Group>
      </Div>

      <Footer 
        onAboutApp={handleAboutApp}
        onLegalInfo={handleLegalInfo}
      />
    </Panel>
  );
};

export default LegalInfo; 