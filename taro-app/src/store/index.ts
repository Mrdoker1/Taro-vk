import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appReducer from './slices/appSlice';
import horoscopeReducer from './slices/horoscopeSlice';
import taroDecksReducer from './slices/taroDecksSlice';
import taroSpreadsReducer from './slices/taroSpreadsSlice';
import promptReducer from './slices/promptSlice';
import generationReducer from './slices/generationSlice';
import calendarReducer from './slices/calendarSlice';
import pinsReducer from './slices/pinsSlice';
import starsReducer from './slices/starsSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    horoscope: horoscopeReducer,
    taroDecks: taroDecksReducer,
    taroSpreads: taroSpreadsReducer,
    prompt: promptReducer,
    generation: generationReducer,
    calendar: calendarReducer,
    pins: pinsReducer,
    stars: starsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 