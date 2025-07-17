import { StyleSheet, Text, View, Modal, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getUserFromStorage } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BillModal = ({ visible, onClose, items }) => {
    const systemTheme = useColorScheme();
    const isDark = systemTheme === 'dark';

    const bgColor = isDark ? '#002b36' : '#fdf6e3';
    const textColor = isDark ? '#fff' : '#000';
    const borderColor = isDark ? '#888' : '#ccc';
    const [user, setuser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('KiranaKart_User');

                if (storedUser) setuser(JSON.parse(storedUser));
                console.log(storedUser);
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };

        fetchUser();
    }, []);


    const billId = `INV-${Date.now()}`;
    const timestamp = new Date().toLocaleString();

    const totalCost = Array.isArray(items)
        ? items.reduce((sum, item) => sum + item.total, 0)
        : 0;


    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={[styles.title, { color: textColor }]}>🧾 KiranaKart Bill</Text>
                    <Text style={[styles.subText, { color: textColor }]}>Shop Name: {user?.shop ||'KiranaKart'}</Text>
                    <Text style={[styles.subText, { color: textColor }]}>Bill ID: {billId}</Text>
                    <Text style={[styles.subText, { color: textColor, paddingBottom: 20 }]}>Date: {timestamp}</Text>

                    <View style={[styles.row, { marginBottom: 6 }]}>
                        <Text style={[styles.cell, { color: textColor, flex: 0.6, fontWeight: 'bold' }]}>S. No</Text>
                        <Text style={[styles.cell, { color: textColor, flex: 2, fontWeight: 'bold' }]}>Name</Text>
                        <Text style={[styles.cell, { color: textColor, flex: 1, fontWeight: 'bold' }]}>Qty</Text>
                        <Text style={[styles.cell, { color: textColor, flex: 1, fontWeight: 'bold' }]}>Price</Text>
                    </View>
                    <View style={styles.separator} />

                    {/* Items List */}
                    {items.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={[styles.cell, { color: textColor, flex: 0.6 }]}>{item.sno}</Text>
                            <Text style={[styles.cell, { color: textColor, flex: 2 }]}>
                                {item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name}
                            </Text>
                            <Text style={[styles.cell, { color: textColor, flex: 1 }]}>{item.qty}</Text>
                            <Text style={[styles.cell, { color: textColor, flex: 1 }]}>₹{item.total.toFixed(2)}</Text>
                        </View>
                    ))}

                    <View style={styles.separator} />
                    <Text style={[styles.totalText, { color: textColor }]}>Total: ₹{totalCost.toFixed(2)}</Text>

                    <TouchableOpacity style={styles.okButton} onPress={onClose}>
                        <Text style={styles.okText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default BillModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
    },
    modalContent: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    subText: {
        fontSize: 12,
        marginTop: 2,
    },
    separator: {
        borderBottomWidth: 1,
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cell: {
        fontSize: 12,
        textAlign: 'center',
    },
    totalText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    okButton: {
        marginTop: 20,
        backgroundColor: 'green',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    okText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
