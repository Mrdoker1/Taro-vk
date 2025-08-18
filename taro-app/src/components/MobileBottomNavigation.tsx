import React from 'react';
import { Tabbar, TabbarItem } from '@vkontakte/vkui';
import { 
  Icon20HomeOutline, 
  Icon20Cards2Outline, 
  Icon20MessageOutline, 
  Icon20CalendarOutline, 
  Icon20GearOutline 
} from '@vkontakte/icons';
import { useRouteNavigator, useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import { DEFAULT_VIEW_PANELS } from '../routes';

export const MobileBottomNavigation: React.FC = () => {
  const routeNavigator = useRouteNavigator();
  const { panel: activePanel } = useActiveVkuiLocation();

  const handleNavigation = (route: string) => {
    if (route === '/') {
      routeNavigator.push('/');
    } else {
      routeNavigator.push(route);
    }
  };

  // Определяем активную вкладку на основе текущей панели
  const getActiveTab = () => {
    switch (activePanel) {
      case DEFAULT_VIEW_PANELS.HOME:
        return 'home';
      case DEFAULT_VIEW_PANELS.TARO_SPREADS:
        return 'spreads';
      case DEFAULT_VIEW_PANELS.DAILY_AFFIRMATION:
        return 'affirmations';
      case DEFAULT_VIEW_PANELS.CALENDAR:
        return 'calendar';
      case DEFAULT_VIEW_PANELS.SETTINGS:
        return 'settings';
      default:
        return 'home';
    }
  };

  return (
    <Tabbar style={{ 
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'var(--vkui--color_background)',
      borderTop: '1px solid var(--vkui--color_separator_primary)'
    }}>
      <TabbarItem
        onClick={() => handleNavigation('/')}
        selected={getActiveTab() === 'home'}
        data-story="home"
        aria-label="Главная"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px'
        }}>
          <Icon20HomeOutline />
          <span>Главная</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/spreads')}
        selected={getActiveTab() === 'spreads'}
        data-story="spreads"
        aria-label="Расклады"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px'
        }}>
          <Icon20Cards2Outline />
          <span>Расклады</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/affirmation')}
        selected={getActiveTab() === 'affirmations'}
        data-story="affirmations"
        aria-label="Аффирмации"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px'
        }}>
          <Icon20MessageOutline />
          <span>Аффирмации</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/calendar')}
        selected={getActiveTab() === 'calendar'}
        data-story="calendar"
        aria-label="Календарь"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px'
        }}>
          <Icon20CalendarOutline />
          <span>Календарь</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation(`/${DEFAULT_VIEW_PANELS.SETTINGS}`)}
        selected={getActiveTab() === 'settings'}
        data-story="settings"
        aria-label="Настройки"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px'
        }}>
          <Icon20GearOutline />
          <span>Настройки</span>
        </div>
      </TabbarItem>
    </Tabbar>
  );
};
