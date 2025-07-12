import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Platform,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getItems, getFontSize, getMinQuantity, getTheme } from '../lib/storage';
import AllItems from './AllItems';
import CreateScreen from './CreateScreen';

const HomeScreen = () => {
  const navigation = useNavigation();
  const systemTheme = useColorScheme();

  const [data, setData] = useState([]);
  const [view, setView] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const [minQty, setMinQty] = useState(1);
  const [themeMode, setThemeMode] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const effectiveTheme = themeMode === 0 ? systemTheme : themeMode === 1 ? 'light' : 'dark';
  const isDark = effectiveTheme === 'dark';

  const fontSizePresets = {
    button: [10, 12, 14],
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || '?';

  const loadEverything = async () => {
    setLoading(true);
    const items = await getItems();
    const font = await getFontSize();
    const qty = await getMinQuantity();
    const themeVal = await getTheme();
    const storedUser = await AsyncStorage.getItem('KiranaKart_User');

    if (storedUser) setUser(JSON.parse(storedUser));
    setData(items);
    setFontSize(font);
    setMinQty(qty);
    setThemeMode(themeVal);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadEverything();
    }, [])
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDark ? '#002b36' : '#fdf6e3');
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    }
  }, [isDark]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#002b36' : '#fdf6e3' }]}>
        <ActivityIndicator size="large" color={isDark ? '#2aa198' : 'green'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#002b36' : '#fdf6e3' }]}>
      <View style={styles.header}>
  <View>
    <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
      KiranaKart
    </Text>
    {user?.name && (
      <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#555' }]}>
        Welcome back, {user.name?.split(' ')[0]} !
      </Text>
    )}
  </View>

  <Pressable onPress={() => navigation.navigate('Account')} style={styles.avatar}>
    <Text style={styles.avatarLetter}>{avatarLetter}</Text>
  </Pressable>
</View>


      <View style={styles.btnContainer}>
        <Pressable style={[styles.btn, view === 0 && styles.activeBtn]} onPress={() => setView(0)}>
          <Text
            style={[
              styles.btnText,
              { fontSize: fontSizePresets.button[fontSize] },
              view === 0 && styles.activeText,
            ]}
          >
            All Items
          </Text>
        </Pressable>
        <Pressable style={[styles.btn, view === 1 && styles.activeBtn]} onPress={() => setView(1)}>
          <Text
            style={[
              styles.btnText,
              { fontSize: fontSizePresets.button[fontSize] },
              view === 1 && styles.activeText,
            ]}
          >
            Low Stock
          </Text>
        </Pressable>
        <Pressable style={[styles.btn, view === 2 && styles.activeBtn]} onPress={() => setView(2)}>
          <Text
            style={[
              styles.btnText,
              { fontSize: fontSizePresets.button[fontSize] },
              view === 2 && styles.activeText,
            ]}
          >
            Create
          </Text>
        </Pressable>
      </View>

      {view === 0 && <AllItems data={data} minQty={minQty} />}
      {view === 1 && <AllItems data={data.filter(item => item.stock < minQty)} minQty={minQty} />}
      {view === 2 && <CreateScreen data={data} setdata={setData} />}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitle: {
  fontSize: 13,
  marginTop: 1,
},

  avatar: {
    backgroundColor: 'green',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
    marginHorizontal: 20,
    gap: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 50,
    borderWidth: 1.4,
    borderColor: 'green',
  },
  btnText: {
    color: 'green',
    fontWeight: 'bold',
  },
  activeBtn: {
    backgroundColor: 'green',
  },
  activeText: {
    color: 'white',
  },
});
