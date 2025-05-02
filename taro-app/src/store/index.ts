import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appReducer from './slices/appSlice';
import horoscopeReducer from './slices/horoscopeSlice';
import taroDecksReducer from './slices/taroDecksSlice';
import taroSpreadsReducer from './slices/taroSpreadsSlice';
import promptReducer from './slices/promptSlice';
import generationReducer from './slices/generationSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    horoscope: horoscopeReducer,
    taroDecks: taroDecksReducer,
    taroSpreads: taroSpreadsReducer,
    prompt: promptReducer,
    generation: generationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 