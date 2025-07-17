// src/lib/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { clearAllBills } from './bills';

const USER_KEY = 'KiranaKart_User';
const SETTINGS_THEME = 'KiranaKart_Theme';
const SETTINGS_FONT_SIZE = 'KiranaKart_FontSize';
const SETTINGS_MIN_QTY = 'KiranaKart_MinQuantity';
const ITEMS_KEY = 'KiranaKart_Items';

export const saveUserToStorage = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUserFromStorage = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

export const editUserInStorage = async (updates) => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) return false;

    const existingUser = JSON.parse(userData);
    const updatedUser = { ...existingUser, ...updates };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error editing user info:', error);
    return null;
  }
};

export const deleteUserFromStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      USER_KEY,
      SETTINGS_THEME,
      SETTINGS_FONT_SIZE,
      SETTINGS_MIN_QTY,
      ITEMS_KEY
    ]);
    await clearAllBills();
  } catch (error) {
    console.error('Error deleting user and app data:', error);
  }
};

export const saveTheme = async (value) => {
  try {
    await AsyncStorage.setItem(SETTINGS_THEME, value.toString());
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getTheme = async () => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_THEME);
    return value !== null ? parseInt(value) : 0; // 0 = system default
  } catch (error) {
    console.error('Error retrieving theme:', error);
    return 0;
  }
};

export const saveFontSize = async (value) => {
  try {
    await AsyncStorage.setItem(SETTINGS_FONT_SIZE, value.toString());
  } catch (error) {
    console.error('Error saving font size:', error);
  }
};

export const getFontSize = async () => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_FONT_SIZE);
    return value !== null ? parseInt(value) : 1; // 1 = medium
  } catch (error) {
    console.error('Error retrieving font size:', error);
    return 1;
  }
};

export const saveMinQuantity = async (value) => {
  try {
    await AsyncStorage.setItem(SETTINGS_MIN_QTY, value.toString());
  } catch (error) {
    console.error('Error saving min quantity:', error);
  }
};

export const getMinQuantity = async () => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_MIN_QTY);
    return value !== null ? parseInt(value) : 1; // default minimum quantity
  } catch (error) {
    console.error('Error retrieving min quantity:', error);
    return 1;
  }
};

export const saveItems = async (items) => {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving items:', error);
  }
};

export const getItems = async () => {
  try {
    const data = await AsyncStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving items:', error);
    return [];
  }
};

export const addItem = async (newItemData) => {
  try {
    const items = await getItems();

    const newItem = {
      id: uuid.v4(),
      ...newItemData
    };

    const updatedItems = [...items, newItem];
    await saveItems(updatedItems);

    return newItem;
  } catch (error) {
    console.error('Error adding item:', error);
  }
};

export const updateItem = async (updatedItem) => {
  const items = await getItems();
  const newList = items.map(item =>
    item.id === updatedItem.id ? { ...item, ...updatedItem } : item
  );
  await saveItems(newList);
};

export const deleteItem = async (id) => {
  const items = await getItems();
  const newList = items.filter(item => item.id !== id);
  await saveItems(newList);
};
