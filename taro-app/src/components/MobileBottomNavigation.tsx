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

const MobileBottomNavigationComponent: React.FC = () => {
  const routeNavigator = useRouteNavigator();
  const { panel: activePanel } = useActiveVkuiLocation();

  // Отладочная информация
  console.log('🔍 MobileBottomNavigation - activePanel:', activePanel);
  console.log('🔍 Available panels:', DEFAULT_VIEW_PANELS);

  const handleNavigation = (route: string) => {
    if (route === '/') {
      routeNavigator.push('/');
    } else {
      routeNavigator.push(route);
    }
  };

  // Определяем активную вкладку на основе текущей панели
  const getActiveTab = () => {
    const activeTab = (() => {
      switch (activePanel) {
        case DEFAULT_VIEW_PANELS.HOME:
          return 'home';
        case DEFAULT_VIEW_PANELS.TARO_SPREADS:
        case DEFAULT_VIEW_PANELS.DECK_DETAILS:
        case DEFAULT_VIEW_PANELS.CARD_DETAILS:
        case DEFAULT_VIEW_PANELS.TARO_READING:
          return 'spreads';
        case DEFAULT_VIEW_PANELS.DAILY_AFFIRMATION:
          return 'affirmations';
        case DEFAULT_VIEW_PANELS.CALENDAR:
          return 'calendar';
        case DEFAULT_VIEW_PANELS.SETTINGS:
        case DEFAULT_VIEW_PANELS.PROFILE:
        case DEFAULT_VIEW_PANELS.ABOUT_APP:
        case DEFAULT_VIEW_PANELS.LEGAL_INFO:
        case DEFAULT_VIEW_PANELS.STARS_PURCHASE:
        case DEFAULT_VIEW_PANELS.COLLECTION_PINS:
          return 'settings';
        default:
          console.log('⚠️ Unknown panel, defaulting to home:', activePanel);
          return 'home';
      }
    })();
    
    console.log('🎯 Active tab determined:', activeTab, 'for panel:', activePanel);
    return activeTab;
  };

  const currentActiveTab = getActiveTab();
  
  // Отладочная информация для каждой вкладки
  console.log('📊 Tab states:', {
    home: currentActiveTab === 'home',
    spreads: currentActiveTab === 'spreads', 
    affirmations: currentActiveTab === 'affirmations',
    calendar: currentActiveTab === 'calendar',
    settings: currentActiveTab === 'settings'
  });

  return (
    <Tabbar style={{ 
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'var(--app-background-color)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <TabbarItem
        onClick={() => handleNavigation('/')}
        selected={currentActiveTab === 'home'}
        data-story="home"
        aria-label="Главная"
        className={currentActiveTab === 'home' ? 'active-tab' : 'inactive-tab'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px',
          color: `${currentActiveTab === 'home' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
        }}>
          <Icon20HomeOutline style={{ 
            color: `${currentActiveTab === 'home' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
            fill: `${currentActiveTab === 'home' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }} />
          <span style={{ 
            color: `${currentActiveTab === 'home' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }}>Главная</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/spreads')}
        selected={currentActiveTab === 'spreads'}
        data-story="spreads"
        aria-label="Расклады"
        className={currentActiveTab === 'spreads' ? 'active-tab' : 'inactive-tab'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px',
          color: `${currentActiveTab === 'spreads' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
        }}>
          <Icon20Cards2Outline style={{ 
            color: `${currentActiveTab === 'spreads' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
            fill: `${currentActiveTab === 'spreads' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }} />
          <span style={{ 
            color: `${currentActiveTab === 'spreads' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }}>Расклады</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/affirmation')}
        selected={currentActiveTab === 'affirmations'}
        data-story="affirmations"
        aria-label="Аффирмации"
        className={currentActiveTab === 'affirmations' ? 'active-tab' : 'inactive-tab'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px',
          color: `${currentActiveTab === 'affirmations' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
        }}>
          <Icon20MessageOutline style={{ 
            color: `${currentActiveTab === 'affirmations' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
            fill: `${currentActiveTab === 'affirmations' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }} />
          <span style={{ 
            color: `${currentActiveTab === 'affirmations' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }}>Аффирмации</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation('/calendar')}
        selected={currentActiveTab === 'calendar'}
        data-story="calendar"
        aria-label="Календарь"
        className={currentActiveTab === 'calendar' ? 'active-tab' : 'inactive-tab'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px',
          color: `${currentActiveTab === 'calendar' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
        }}>
          <Icon20CalendarOutline style={{ 
            color: `${currentActiveTab === 'calendar' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
            fill: `${currentActiveTab === 'calendar' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }} />
          <span style={{ 
            color: `${currentActiveTab === 'calendar' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }}>Календарь</span>
        </div>
      </TabbarItem>
      
      <TabbarItem
        onClick={() => handleNavigation(`/${DEFAULT_VIEW_PANELS.SETTINGS}`)}
        selected={currentActiveTab === 'settings'}
        data-story="settings"
        aria-label="Настройки"
        className={currentActiveTab === 'settings' ? 'active-tab' : 'inactive-tab'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1px',
          fontSize: '9px',
          lineHeight: '10px',
          color: `${currentActiveTab === 'settings' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
        }}>
          <Icon20GearOutline style={{ 
            color: `${currentActiveTab === 'settings' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`,
            fill: `${currentActiveTab === 'settings' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }} />
          <span style={{ 
            color: `${currentActiveTab === 'settings' ? 'rgba(210, 175, 80, 1)' : 'rgba(255, 255, 255, 0.6)'} !important`
          }}>Настройки</span>
        </div>
      </TabbarItem>
    </Tabbar>
  );
};

export const MobileBottomNavigation = React.memo(MobileBottomNavigationComponent);
