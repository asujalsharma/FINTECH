// src/redux/store.js

import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootReducer } from './RootReducer';

// persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// create persisted reducer
const persistedReducer = persistReducer(persistConfig, RootReducer);

// create ONE store instance
const store = createStore(persistedReducer);

// create ONE persistor instance
const persistor = persistStore(store);

export { store, persistor };
