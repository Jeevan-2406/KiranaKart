import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getFontSize, getTheme } from '../lib/storage';

const AllItems = ({ data, minQty }) => {
  const systemTheme = useColorScheme();
  const [fontSize, setFontSize] = useState(1);
  const [theme, setTheme] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const textTheme = theme === 0 ? systemTheme : theme === 1 ? 'light' : 'dark';
  const isDark = textTheme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#002b36' : '#fdf6e3';

  const fontSizePresets = {
    heading: [14, 16, 18],
    item: [10, 12, 14],
  };

  const uniqueCategories = [...new Set(data.map((item) => item.category || 'Uncategorized'))];

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const size = await getFontSize();
        const themeMode = await getTheme();
        setFontSize(size);
        setTheme(themeMode);
      };
      loadSettings();
    }, [])
  );

  const filteredItems = data
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      categoryFilter ? item.category === categoryFilter : true
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.stock - b.stock;
      return 0;
    });

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Search Input */}
      <TextInput
        placeholder="Search items..."
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={{
          borderWidth: 1,
          borderColor: isDark ? '#2aa198' : '#888',
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 5,
          fontSize: 14,
          color: textColor,
          backgroundColor: isDark ? '#073642' : '#fff',
        }}
      />

      {/* Sort Buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 10, paddingHorizontal: 20, flexWrap: 'wrap' }}>
        <Pressable
          onPress={() => {
            setSortBy('name');
            setCategoryFilter(null);
          }}
          style={[styles.sortButton, sortBy === 'name' && !categoryFilter && styles.activeButton]}
        >
          <Text style={[styles.sortText, sortBy === 'name' && !categoryFilter && styles.activeText]}>Name</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setSortBy('stock');
            setCategoryFilter(null);
          }}
          style={[styles.sortButton, sortBy === 'stock' && !categoryFilter && styles.activeButton]}
        >
          <Text style={[styles.sortText, sortBy === 'stock' && !categoryFilter && styles.activeText]}>Stock</Text>
        </Pressable>

        <Pressable
          onPress={() => setCategoryModalVisible(true)}
          style={[styles.sortButton, categoryFilter && styles.activeButton]}
        >
          <Text style={[styles.sortText, categoryFilter && styles.activeText]}>
            {categoryFilter || 'Category'}
          </Text>
        </Pressable>

        {categoryFilter && (
          <Pressable onPress={() => setCategoryFilter(null)}>
            <Text style={{ color: 'red', marginTop: 6, fontSize: 12 }}>Clear Category</Text>
          </Pressable>
        )}
      </View>

      {/* Category Selection Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setCategoryModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#073642' : '#fff' }]}>
            {uniqueCategories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategoryFilter(cat);
                  setSortBy('');
                  setCategoryModalVisible(false);
                }}
                style={styles.modalItem}
              >
                <Text style={{ color: isDark ? '#fff' : '#000' }}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Heading */}
      <View style={styles.headingContainer}>
        <Text style={[styles.headingText, { color: textColor, fontSize: fontSizePresets.heading[fontSize] }]}>Items</Text>
        <Text style={[styles.headingText, { color: textColor, fontSize: fontSizePresets.heading[fontSize] }]}>Quantity</Text>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemContainer,
              {
                backgroundColor: item.stock < minQty ? '#ffcccc' : '#D7F6BFFF',
              },
            ]}
          >
            <View>
              <Text style={[styles.itemText, { fontSize: fontSizePresets.item[fontSize], color: "#000" }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemSubText, { color: "#555", fontSize: 10 }]}>
                {item.category}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.itemText, { fontSize: fontSizePresets.item[fontSize], color: "#000" }]}>
                {item.stock} {item.unit}
              </Text>
              {item.price !== null && item.price !== undefined && (
                <Text style={[styles.itemSubText, { color: "#555", fontSize: 10 }]}>
                  ₹{item.price} / {item.unit}
                </Text>
              )}
            </View>
          </View>

        )}
        contentContainerStyle={{ gap: 7, paddingBottom: 20 }}
        style={{ flex: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={{
            textAlign: 'center',
            marginTop: 190,
            color: isDark ? '#ccc' : '#555',
            fontSize: 15,
          }}>
            No items in inventory. Please add some items to manage your stock.
          </Text>
        )}

      />
    </View>
  );
};

export default AllItems;

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    marginBottom: 15,
  },
  headingText: {
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderRadius: 7,
  },
  itemText: {
    fontWeight: '600',
  },
  itemSubText: {
    fontSize: 10,
    marginTop: 2,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: 'green',
    backgroundColor: 'transparent',
  },
  activeButton: {
    backgroundColor: 'green',
  },
  sortText: {
    fontSize: 12,
    color: 'green',
    fontWeight: 'bold',
  },
  activeText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  modalBox: {
    width: '80%',
    borderRadius: 12,
    padding: 15,
    elevation: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
});
