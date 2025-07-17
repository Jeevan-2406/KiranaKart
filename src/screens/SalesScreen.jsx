import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, useColorScheme,
} from 'react-native';
import { getBills, clearAllBills } from '../lib/bills';
import BillModal from './BillModal';
import { getTheme } from '../lib/storage';

const SalesScreen = () => {
  const [bills, setBills] = useState([]);
  const [selectedBillItems, setSelectedBillItems] = useState([]);
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [themeSetting, setThemeSetting] = useState(0);

  const systemTheme = useColorScheme();

  useEffect(() => {
    const loadData = async () => {
      const data = await getBills();
      setBills(data.reverse());

      const themeVal = await getTheme(); // 0=system, 1=light, 2=dark
      setThemeSetting(themeVal);
    };

    loadData();
  }, []);

  const textTheme = themeSetting === 0 ? systemTheme : themeSetting === 1 ? 'light' : 'dark';
  const isDark = textTheme === 'dark';

  const handleBillClick = (bill) => {
    const selected = bill.items.map((item, index) => ({
      sno: index + 1,
      name: item.name,
      qty: item.quantity,
      total: item.total,
    }));
    setSelectedBillItems(selected);
    setBillModalVisible(true);
  };

  const handleConfirmClear = async () => {
    await clearAllBills();
    setBills([]);
    setConfirmModalVisible(false);
  };

  const renderBill = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#073642' : '#fcf9e3' }]}
      onPress={() => handleBillClick(item)}
    >
      <Text style={[styles.billId, { color: isDark ? '#eee' : '#000' }]}>
        {item.id.replace('bill_', '')}
      </Text>
      <Text style={[styles.total, { color: isDark ? '#ccc' : '#444' }]}>
        ₹{item.total.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#002b36' : '#fdf6e3' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#000' }]}>Sales History</Text>

      {bills.length === 0 ? (
        <Text style={{ textAlign: 'center', color: isDark ? '#aaa' : '#555' }}>
          No bills yet.
        </Text>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          renderItem={renderBill}
          contentContainerStyle={{ gap: 10, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.clearBtn} onPress={() => setConfirmModalVisible(true)}>
        <Text style={styles.clearText}>Clear Sales History</Text>
      </TouchableOpacity>

      {/* Bill Modal */}
      <BillModal
        visible={billModalVisible}
        items={selectedBillItems}
        onClose={() => setBillModalVisible(false)}
      />

      {/* Confirm Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[
            styles.modalBox,
            {
              backgroundColor: isDark ? '#073642' : '#fff',
              borderColor: isDark ? '#586e75' : '#ccc',
            }
          ]}>
            <Text style={[styles.modalText, { color: isDark ? '#fff' : '#000' }]}>
              Are you sure you want to clear all sales?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'gray' }]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'crimson' }]}
                onPress={handleConfirmClear}
              >
                <Text style={styles.modalBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingVertical: 3
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billId: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  total: {
    fontSize: 14,
  },
  clearBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'crimson',
    paddingVertical: 12,
    borderRadius: 10,
  },
  clearText: {
    textAlign: 'center',
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
    padding: 24,
    borderRadius: 10,
    width: '80%',
    borderWidth: 1,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
