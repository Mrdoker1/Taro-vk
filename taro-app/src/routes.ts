import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  PERSIK: 'persik',
  NEW_PAGE: 'new-page',
  SETTINGS: 'settings',
  DECK_DETAILS: 'deck-details',
  CARD_DETAILS: 'card-details',
  TARO_SPREADS: 'taro-spreads',
  TARO_READING: 'taro-reading',
  DAILY_AFFIRMATION: 'daily-affirmation',
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.PERSIK, `/${DEFAULT_VIEW_PANELS.PERSIK}`, []),
      createPanel(DEFAULT_VIEW_PANELS.NEW_PAGE, `/${DEFAULT_VIEW_PANELS.NEW_PAGE}`, []),
      createPanel(DEFAULT_VIEW_PANELS.SETTINGS, `/${DEFAULT_VIEW_PANELS.SETTINGS}`, []),
      createPanel(DEFAULT_VIEW_PANELS.DECK_DETAILS, '/deck/:deckId', []),
      createPanel(DEFAULT_VIEW_PANELS.CARD_DETAILS, '/deck/:deckId/card/:cardId', []),
      createPanel(DEFAULT_VIEW_PANELS.TARO_SPREADS, '/spreads', []),
      createPanel(DEFAULT_VIEW_PANELS.TARO_READING, '/reading/:spreadId/:deckId', []),
      createPanel(DEFAULT_VIEW_PANELS.DAILY_AFFIRMATION, '/affirmation', []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
