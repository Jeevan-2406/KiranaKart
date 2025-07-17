import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  useColorScheme,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { getFontSize, getTheme } from '../lib/storage';
import { saveBill } from '../lib/bills';
import BillModal from './BillModal';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid'
import { getItems, saveItems } from '../lib/storage'

const Cart = () => {
  const route = useRoute();
  const { cartItems } = route.params;
  const navigation = useNavigation();

  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const [quantities, setQuantities] = useState({});
  const [items, setItems] = useState(cartItems);
  const [stockModal, setStockModal] = useState({ visible: false, message: '' });
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);


  const textTheme = theme === 0 ? systemTheme : theme === 1 ? 'light' : 'dark';
  const isDark = textTheme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#002b36' : '#fdf6e3';

  const itemBoxColor = isDark ? '#fdf6e3' : '#002b36';
  const itemBoxText = isDark ? '#000' : '#fff';

  const fontSizePresets = {
    heading: [22, 24, 26],
    item: [9,10,11],
    sub: [8,9,10],
  };

  useEffect(() => {
    const loadSettings = async () => {
      const themeMode = await getTheme();
      const font = await getFontSize();
      setTheme(themeMode);
      setFontSize(font);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    let total = 0;
    items.forEach(item => {
      const qty = parseInt(quantities[item.id] || '0');
      total += qty * item.price;
    });
    setTotalCost(total);
  }, [quantities, items]);

  const handleQuantityChange = (id, value, max) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (parseInt(numericValue || '0') > max) {
      setStockModal({ visible: true, message: `Only ${max} available` });
      setQuantities(prev => ({ ...prev, [id]: max.toString() }));
    } else {
      setQuantities(prev => ({ ...prev, [id]: numericValue }));
    }
  };

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setQuantities(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleGenerateBill = async () => {
    const selected = items
      .filter((item) => parseInt(quantities[item.id]) > 0)
      .map((item, index) => ({
        sno: index + 1,
        name: item.name,
        qty: parseInt(quantities[item.id]),
        total: parseInt(quantities[item.id]) * item.price,
        unitPrice: item.price,
        id: item.id, // ✅ needed for stock update
      }));

    if (selected.length === 0) return; // prevent empty bills

    const newBill = {
      id: `bill_${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: selected.map(({ name, qty, unitPrice, total }) => ({
        name,
        quantity: qty,
        unitPrice,
        total,
      })),
      total: selected.reduce((sum, item) => sum + item.total, 0),
    };

    await saveBill(newBill);

    // ✅ Update stocks in AsyncStorage
    const currentItems = await getItems();

    const updatedItems = currentItems.map((storedItem) => {
      const purchased = selected.find((item) => item.id === storedItem.id);
      if (purchased) {
        return {
          ...storedItem,
          stock: Math.max(0, storedItem.stock - purchased.qty),
        };
      }
      return storedItem;
    });

    await saveItems(updatedItems);

    setSelectedItems(selected);
    setBillModalVisible(true);
  };



  const renderItemBox = ({ item }) => (
    <View style={styles.itemBoxWrapper}>
      <View style={[styles.itemBox, { backgroundColor: itemBoxColor }]}>
        <View style={styles.row}>
          <Text style={[styles.value, { color: itemBoxText, fontSize: fontSizePresets.item[fontSize],fontWeight: '800' }]}>
            {item.name.length > 12 ? item.name.slice(0, 12) + '…' : item.name}
          </Text>

          <Text style={[styles.value, { color: itemBoxText, fontSize: fontSizePresets.item[fontSize] }]}>
            {item.stock} {item.unit}
          </Text>

          <TextInput
            value={quantities[item.id] || ''}
            onChangeText={(text) => handleQuantityChange(item.id, text, item.stock)}
            placeholder="0"
            placeholderTextColor={isDark ? '#888' : '#aaa'}
            keyboardType="numeric"
            style={[
              styles.input,
              {
                borderColor: isDark ? '#000' : '#fff',
                color: itemBoxText,
                fontSize: fontSizePresets.item[fontSize],
                width: 50,
              },
            ]}
          />

          <Text style={[styles.value, { color: itemBoxText, fontSize: fontSizePresets.sub[fontSize] }]}>
            ₹{item.price} / {item.unit}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.closeBadge}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.heading, { color: textColor, fontSize: fontSizePresets.heading[fontSize] }]}>
        Cart Items
      </Text>

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#555' }]}>Your cart is empty.</Text>
      ) : (
        <>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.label, { color: textColor }]}>Name</Text>
            <Text style={[styles.label, { color: textColor }]}>Qty</Text>
            <Text style={[styles.label, { color: textColor }]}>You want</Text>
            <Text style={[styles.label, { color: textColor }]}>Rate</Text>
          </View>

          {/* Scrollable FlatList */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItemBox}
            contentContainerStyle={{ gap: 14, paddingBottom: 100 }}
          />

          {/* Total & Generate Bill */}
          <View style={styles.bottomBar}>
            <Text style={[styles.totalText, { color: textColor }]}>
              Total: ₹{totalCost.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.billBtn}
              onPress={handleGenerateBill}
            >
              <Text style={styles.billText}>Generate Bill</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Stock Limit Modal */}
      <Modal transparent visible={stockModal.visible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[
            styles.modalBox,
            {
              backgroundColor: isDark ? '#073642' : '#fefefe', // solarized or light
              borderColor: isDark ? '#586e75' : '#ccc',
            }
          ]}>
            <Text style={[styles.modalText, { color: textColor }]}>{stockModal.message}</Text>
            <TouchableOpacity onPress={() => setStockModal({ visible: false, message: '' })}>
              <Text style={styles.modalClose}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bill Modal */}
      <BillModal
        visible={billModalVisible}
        onClose={() => {
          setBillModalVisible(false);
          navigation.navigate('Home');
        }}
        items={selectedItems} // ✅ this is the correct prop
      />


    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  heading: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemBoxWrapper: {
    position: 'relative',
    width: '100%',
    height: 60,
  },
  itemBox: {
    marginTop: 4,
    height: 60,
    width: '98%',
    borderRadius: 10,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  closeBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  billBtn: {
    backgroundColor: 'green',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  billText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '75%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  modalClose: {
    color: '#1E90FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
