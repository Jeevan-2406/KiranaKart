import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getMinQuantity, saveMinQuantity, getFontSize, saveFontSize, getTheme, saveTheme, editUserInStorage, deleteUserFromStorage } from '../lib/storage';

const AccountScreen = () => {
    const [themeMode, setThemeMode] = useState(0);
    const systemTheme = useColorScheme();
    const effectiveTheme = themeMode === 0 ? systemTheme : (themeMode === 2 ? 'dark' : 'light');
    const isDark = effectiveTheme === 'dark';

    const navigation = useNavigation();

    const [user, setUser] = useState(null);
    const [minQty, setMinQty] = useState(1);
    const themeLabel = ['System', 'Light', 'Dark'][themeMode];
    const [fontSize, setFontSize] = useState(1);
    const [isFontSizeModalVisible, setFontSizeModalVisible] = useState(false);
    const [isThemeModalVisible, setThemeModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedShop, setEditedShop] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [editErrors, setEditErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');

    const fontSizePresets = {
        name: [14, 16, 18],
        label: [11, 13, 15],
        value: [12, 14, 16],
        setting: [11, 13, 15],
        input: [11, 12, 13],
        logout: [13, 14, 15],
    };


    useEffect(() => {
        const loadUser = async () => {
            const stored = await AsyncStorage.getItem('KiranaKart_User');
            if (stored) setUser(JSON.parse(stored));
        };

        const loadSettings = async () => {
            const qty = await getMinQuantity();
            setMinQty(qty);
            const size = await getFontSize();
            setFontSize(size);
            const themeVal = await getTheme();
            setThemeMode(themeVal);
        };

        loadUser();
        loadSettings();
    }, []);

    const handleSelectFontSize = async (value) => {
        setFontSize(value);
        await saveFontSize(value);
        setFontSizeModalVisible(false);
    };

    const handleSelectTheme = async (value) => {
        setThemeMode(value);
        await saveTheme(value);
        setThemeModalVisible(false);
    };

    const fontSizeLabel = ['Small', 'Medium', 'Large'][fontSize];

    const handleQtyChange = async (value) => {
        const intValue = parseInt(value) || 1;
        setMinQty(intValue);
        await saveMinQuantity(intValue);
    };

    const validateEditForm = () => {
        const errors = {};

        if (!/^[A-Za-z ]{3,30}$/.test(editedName.trim())) {
            errors.name = 'Name must be 3–30 letters only.';
        }

        if (!/^[A-Za-z ]{3,30}$/.test(editedShop.trim())) {
            errors.shop = 'Shop name must be 3–30 letters only.';
        }

        if (!/^[A-Za-z0-9 ,.-]{5,100}$/.test(editedAddress.trim())) {
            errors.address = 'Enter a valid address (min 5 characters).';
        }

        if (!/^[6-9]\d{9}$/.test(editedPhone.trim())) {
            errors.phone = 'Enter a valid 10-digit Indian phone number.';
        }

        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogout = async () => {
        await deleteUserFromStorage();
        navigation.replace('Signup');
    };

    if (!user) return null;

    const avatarLetter = user.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#002b36' : '#fdf6e3' }]}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>KiranaKart</Text>

                <Pressable
                    style={styles.editIcon}
                    onPress={() => {
                        setEditedName(user.name);
                        setEditedShop(user.shop);
                        setEditedAddress(user.address);
                        setEditedPhone(user.phone);
                        setEditModalVisible(true);
                    }}
                >
                    <Icon name="create-outline" size={22} color={isDark ? '#fff' : '#000'} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { borderColor: isDark ? '#fff' : '#000' }, { backgroundColor: isDark ? 'green' : '#27ae60' }]}>
                        <Text style={styles.avatarText}>{avatarLetter}</Text>
                    </View>
                    <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.name[fontSize] }]}>
                        {user.name}
                    </Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }, { fontSize: fontSizePresets.label[fontSize] }]}>Shop Name</Text>
                    <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.value[fontSize] }]}>{user.shop}</Text>

                    <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }, { fontSize: fontSizePresets.label[fontSize] }]}>Address</Text>
                    <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.value[fontSize] }]}>{user.address}</Text>

                    <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }, { fontSize: fontSizePresets.label[fontSize] }]}>Phone Number</Text>
                    <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.value[fontSize] }]}>{user.phone}</Text>
                </View>

                <View style={styles.settingSection}>
                    <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.setting[fontSize] }]}>
                        Minimum Quantity
                    </Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? '#073642' : '#eee', color: isDark ? '#fff' : '#000', fontSize: fontSizePresets.input[fontSize], paddingVertical:7 }]}
                        keyboardType="number-pad"
                        value={minQty.toString()}
                        onChangeText={handleQtyChange}
                        placeholder="Enter minimum quantity"
                        placeholderTextColor={isDark ? '#aaa' : '#555'}
                    />
                </View>

                <View style={styles.settingSection}>
                    <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.setting[fontSize] }]}>Font Size</Text>
                    <Pressable onPress={() => setFontSizeModalVisible(true)} style={[styles.input, { backgroundColor: isDark ? '#073642' : '#eee' }]}>
                        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: fontSizePresets.input[fontSize] }}>{fontSizeLabel}</Text>
                    </Pressable>
                </View>

                <View style={styles.settingSection}>
                    <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#000' }, { fontSize: fontSizePresets.setting[fontSize] }]}>Theme</Text>
                    <Pressable onPress={() => setThemeModalVisible(true)} style={[styles.input, { backgroundColor: isDark ? '#073642' : '#eee' }]}>
                        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: fontSizePresets.input[fontSize] }}>{themeLabel}</Text>
                    </Pressable>
                </View>

                <Pressable style={styles.logoutBtn} onPress={() => setConfirmDeleteVisible(true)}>
                    <Text style={[styles.logoutText, { fontSize: fontSizePresets.logout[fontSize] }]}>Delete Account</Text>
                </Pressable>

            </ScrollView>

            {/* Font Size Modal */}
            <Modal animationType="slide" transparent={true} visible={isFontSizeModalVisible} onRequestClose={() => setFontSizeModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setFontSizeModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#073642' : '#fff' }]} onPress={(e) => e.stopPropagation()}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: isDark ? '#fff' : '#000', marginBottom: 20 }}>Select Font Size</Text>
                        <View style={[styles.separator, { backgroundColor: isDark ? '#777' : '#aaa' }]} />
                        {['Small', 'Medium', 'Large'].map((label, index) => (
                            <Pressable key={index} onPress={() => handleSelectFontSize(index)} style={styles.modalOption}>
                                <Text style={{ fontSize: 12, color: isDark ? '#fff' : '#000' }}>{label}</Text>
                            </Pressable>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Theme Modal */}
            <Modal animationType="slide" transparent={true} visible={isThemeModalVisible} onRequestClose={() => setThemeModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setThemeModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#073642' : '#fff' }]} onPress={(e) => e.stopPropagation()}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: isDark ? '#fff' : '#000', marginBottom: 20 }}>Select Theme</Text>
                        <View style={[styles.separator, { backgroundColor: isDark ? '#777' : '#aaa' }]} />
                        {['System', 'Light', 'Dark'].map((label, index) => (
                            <Pressable key={index} onPress={() => handleSelectTheme(index)} style={styles.modalOption}>
                                <Text style={{ fontSize: 12, color: isDark ? '#fff' : '#000' }}>{label}</Text>
                            </Pressable>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
            {/* Edit User Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={[styles.modalContent, { backgroundColor: isDark ? '#073642' : '#fff' }]}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000', marginBottom: 15 }}>
                            Edit Profile
                        </Text>

                        {[
                            ['name', 'Name', editedName, setEditedName],
                            ['shop', 'Shop Name', editedShop, setEditedShop],
                            ['address', 'Address', editedAddress, setEditedAddress],
                            ['phone', 'Phone Number', editedPhone, setEditedPhone],
                        ].map(([key, label, value, setter], index) => (
                            <View key={index} style={{ width: '100%', marginBottom: 10 }}>
                                <TextInput
                                    placeholder={label}
                                    placeholderTextColor={isDark ? '#aaa' : '#666'}
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: isDark ? '#002b36' : '#f0f0f0',
                                            color: isDark ? '#fff' : '#000',
                                            borderWidth: 1.5,
                                            borderColor:
                                                focusedField === key
                                                    ? 'green'
                                                    : editErrors[key]
                                                        ? 'red'
                                                        : 'gray',
                                        },
                                    ]}
                                    value={value}
                                    onFocus={() => {
                                        setFocusedField(key);
                                        setEditErrors({});
                                    }}

                                    onBlur={() => setFocusedField('')}
                                    onChangeText={(text) => {
                                        setter(text);
                                        setEditErrors(prev => ({ ...prev, [key]: undefined }));
                                    }}
                                />

                                {editErrors[key] && (
                                    <Text style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{editErrors[key]}</Text>
                                )}
                            </View>
                        ))}


                        <Pressable
                            style={{
                                backgroundColor: 'green',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                                marginTop: 10,
                            }}
                            onPress={async () => {
                                const isValid = validateEditForm();
                                if (!isValid) return;

                                try {
                                    const updated = await editUserInStorage({
                                        name: editedName.trim(),
                                        shop: editedShop.trim(),
                                        address: editedAddress.trim(),
                                        phone: editedPhone.trim()
                                    });
                                    setUser(updated);
                                    setEditModalVisible(false);
                                } catch (error) {
                                    console.error("Update failed:", error);
                                }
                            }}

                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Update</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
            {/* Confirm Delete Modal */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }}>
                    <View style={{
                        backgroundColor: isDark ? '#073642' : '#fff',
                        padding: 20,
                        borderRadius: 12,
                        width: '80%',
                        alignItems: 'center',
                    }}>
                        <Text style={{ color: isDark ? '#fff' : '#000', marginBottom: 20 }}>
                            Are you sure you want to delete your account? This will erase all data.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <Pressable
                                onPress={() => {
                                    setConfirmDeleteVisible(false);
                                    handleLogout(); // 🧠 Call your existing function
                                }}
                                style={{ backgroundColor: 'red', padding: 10, borderRadius: 6 }}
                            >
                                <Text style={{ color: '#fff' }}>Yes, Delete</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setConfirmDeleteVisible(false)}
                                style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 6 }}
                            >
                                <Text style={{ color: '#000' }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );

};

export default AccountScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '5%',
        justifyContent: 'flex-start',
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
        marginBottom: -16,
    },
    backBtn: { width: 30 },
    headerTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },
    editIcon: {
        width: 30,
        alignItems: 'flex-end',
    },

    rightSpacer: { width: 30 },
    avatarContainer: { alignItems: 'center', marginTop: 5 },
    avatar: {
        backgroundColor: 'green',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 36, color: 'white', fontWeight: 'bold' },
    name: { marginTop: 10, fontWeight: 'bold' },
    infoSection: { marginTop: 20, paddingHorizontal: 9, gap: 10 },
    label: { fontWeight: '500' },
    value: { fontWeight: '600' },
    settingSection: { marginTop: 7, paddingHorizontal: 9, gap: 5 },
    settingLabel: { fontWeight: '600' },
    input: { padding: 12, borderRadius: 10, fontSize: 16 },
    logoutBtn: {
        marginTop: 'auto',
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 7,
        alignItems: 'center',
        marginBottom: 25,
    },
    logoutText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalOption: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        width: '100%',
        marginBottom: 10,
    },
    scrollContent: {
        gap: 20,
        flexGrow: 1,
    },

});
