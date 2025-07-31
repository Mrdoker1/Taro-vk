import { FC } from 'react';
import {
  Panel,
  NavIdProps,
  Div,
  Group,
  Text,
  Title,
  Button
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Footer } from '../components/Footer';
import { StarButton } from '../components/StarButton';
import { AppHeader } from '../components/AppHeader';

export interface AboutAppProps extends NavIdProps {}

export const AboutApp: FC<AboutAppProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    routeNavigator.back();
  };

  const handleAboutApp = () => {
    // Уже на странице "О приложении"
  };

  const handleLegalInfo = () => {
    routeNavigator.push('/legal-info');
  };

  return (
    <Panel id={id}>
      <AppHeader
        left={
          <Button
            mode="tertiary"
            onClick={handleBackClick}
          >
            Назад
          </Button>
        }
        right={<StarButton size="s" />}
      />
      
      <Div style={{ padding: '0 12px' }}>
        <Group>
          <Div style={{ padding: '16px' }}>
            <Title level="2" style={{ marginBottom: '16px' }}>
              Seluna - расклады и советы Таро
            </Title>
            <Text style={{ marginBottom: '16px' }}>
              Приложение для гадания на картах Таро, получения ежедневных аффирмаций 
              и ведения духовного дневника.
            </Text>
            <Text style={{ marginBottom: '16px' }}>
              Версия: 1.0.0
            </Text>
            <Text>
              Откройте для себя мир Таро и духовного развития вместе с нашим приложением.
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

export default AboutApp; 