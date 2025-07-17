import AsyncStorage from '@react-native-async-storage/async-storage';

const BILLS_KEY = '@bills';

export const saveBill = async (bill) => {
  try {
    const existing = await AsyncStorage.getItem(BILLS_KEY);
    const bills = existing ? JSON.parse(existing) : [];
    bills.push(bill);
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  } catch (e) {
    console.error('Error saving bill:', e);
  }
};

export const getBills = async () => {
  try {
    const data = await AsyncStorage.getItem(BILLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error getting bills:', e);
    return [];
  }
};

export const clearAllBills = async () => {
  try {
    await AsyncStorage.removeItem(BILLS_KEY);
  } catch (e) {
    console.error('Error clearing bills:', e);
  }
};
