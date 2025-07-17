import { FlatList, StyleSheet, Text, TextInput, useColorScheme, View, Pressable, Modal, TouchableOpacity, } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getFontSize, getTheme } from '../lib/storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Cart from './Cart';
import { useNavigation } from '@react-navigation/native';

const AllItems = ({ data, minQty }) => {
  const systemTheme = useColorScheme();
  const [fontSize, setFontSize] = useState(1);
  const [theme, setTheme] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [cartIds, setCartIds] = useState([]);
  const navigation = useNavigation();


  const textTheme = theme === 0 ? systemTheme : theme === 1 ? 'light' : 'dark';
  const isDark = textTheme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#002b36' : '#fdf6e3';

  const fontSizePresets = {
    heading: [12,13,14],
    item: [9,10,11],
    subtext: [7,8,9],
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
    .filter((item) =>
      showLowStockOnly ? item.stock < minQty : true
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
          borderColor: isDark ? '#bbb' : '#111',
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 5,
          fontSize: 14,
          color: textColor,
          backgroundColor: isDark ? '#073642' : '#fcf9e3',
        }}
      />

      {/* Sort Buttons */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, marginBottom: 18, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
          <Pressable
            onPress={() => {
              setSortBy('name');
              setCategoryFilter(null);
              setShowLowStockOnly(false);
            }}
            style={[styles.sortButton, sortBy === 'name' && !categoryFilter && !showLowStockOnly && styles.activeButton]}
          >
            <Text style={[styles.sortText, sortBy === 'name' && !categoryFilter && !showLowStockOnly && styles.activeText]}>
              Name
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSortBy('stock');
              setCategoryFilter(null);
              setShowLowStockOnly(false);
            }}
            style={[styles.sortButton, sortBy === 'stock' && !categoryFilter && !showLowStockOnly && styles.activeButton]}
          >
            <Text style={[styles.sortText, sortBy === 'stock' && !categoryFilter && !showLowStockOnly && styles.activeText]}>
              Stock
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setShowLowStockOnly(!showLowStockOnly);
              setSortBy('');
              setCategoryFilter(null);
            }}
            style={[styles.sortButton, showLowStockOnly && styles.activeButton]}
          >
            <Text style={[styles.sortText, showLowStockOnly && styles.activeText]}>
              Low Stock
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setCategoryModalVisible(true)}
            style={[styles.sortButton, categoryFilter && styles.activeButton]}
          >
            <Text style={[styles.sortText, categoryFilter && styles.activeText]}>
              {(categoryFilter?.length > 6 ? categoryFilter.slice(0, 6) + '…' : categoryFilter) || 'Category'}
            </Text>
          </Pressable>

          {categoryFilter && (
            <Pressable
              onPress={() => setCategoryFilter(null)}
              style={{ marginTop: 4, padding: 4 }}
            >
              <Icon name="trash-outline" size={18} color="red" />
            </Pressable>
          )}
        </View>

        {/* Cart Icon */}
        <TouchableOpacity
          style={{
            backgroundColor: isDark ? '#073642' : '#fcf8e3',
            borderRadius: 10,
            padding: 10,
            elevation: 6,
            marginLeft: 8, // small gap between last sort button & cart
            position: 'relative',
          }}
        >
          <Icon name="cart-outline" size={26} color={isDark ? '#fff' : '#000'} />
          {cartIds.length > 0 && (
            <View style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: 'red',
              borderRadius: 8,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>{cartIds.length}</Text>
            </View>
          )}
        </TouchableOpacity>

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
        <View style={{ flex: 2 }}>
          <Text style={[styles.headingText, { color: textColor, fontSize: fontSizePresets.heading[fontSize] }]}>
            Items
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headingText, { color: textColor, fontSize: fontSizePresets.heading[fontSize], paddingRight: 28, }]}>
            Quantity
          </Text>
        </View>
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
            <View style={{ flex: 2, justifyContent: 'center', }}>
              <Text style={[styles.itemText, { fontSize: fontSizePresets.item[fontSize], color: "#000", paddingLeft: 10 }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemSubText, { color: "#555", fontSize: fontSizePresets.subtext[fontSize], paddingLeft: 10 }]}>
                {item.category}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Left 3/4: Stock and Price */}
              <View style={{ flex: 4 }}>
                <Text style={[styles.itemText, { fontSize: fontSizePresets.item[fontSize], color: "#000" }]}>
                  {item.stock} {item.unit}
                </Text>
                {item.price !== null && item.price !== undefined && (
                  <Text style={[styles.itemSubText, { color: "#555", fontSize: fontSizePresets.subtext[fontSize] }]}>
                    ₹{item.price} / {item.unit}
                  </Text>
                )}
              </View>

              {/* Right 1/4: Plus/Minus Button */}
              <View style={{ flex: 1, alignItems: 'flex-end',paddingRight: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setCartIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <Icon
                    name={cartIds.includes(item.id) ? 'remove-circle-outline' : 'add-circle-outline'}
                    size={22}
                    color={cartIds.includes(item.id) ? 'red' : 'green'}
                  />
                </TouchableOpacity>
              </View>
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
      {cartIds.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            const selectedItems = data.filter(item => cartIds.includes(item.id));
            navigation.navigate('Cart', { cartItems: selectedItems });
          }}
          style={{
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            backgroundColor: '#27ae60',
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 13,
            elevation: 5,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AllItems;

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 45,
    marginBottom: 15,
  },
  headingText: {
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 7,
  },
  itemText: {
    fontWeight: '600',
  },
  itemSubText: {
    fontSize: 7,
    marginTop: 2,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: 'green',
    backgroundColor: 'transparent',
  },
  activeButton: {
    backgroundColor: 'green',
  },
  sortText: {
    fontSize: 10,
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
