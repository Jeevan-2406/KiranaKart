import { FlatList, Pressable, StyleSheet, Text, TextInput, useColorScheme, View, Keyboard, TouchableWithoutFeedback, Animated, ScrollView, KeyboardAvoidingView, Modal } from 'react-native';
import uuid from 'react-native-uuid';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { getFontSize, getMinQuantity, getTheme, addItem, updateItem, deleteItem, saveItems, getItems } from '../lib/storage';
import DropDownPicker from 'react-native-dropdown-picker';

const CreateScreen = ({ data, setdata }) => {
    const fontSizePresets = {
        title: [16, 18, 20],
        input: [10, 12, 14],
        button: [10, 12, 14],
        heading: [12, 14, 16],
        item: [10, 12, 14],
        error: [5, 6, 7],
    };

    const shakeAnim = {
        name: useState(new Animated.Value(0))[0],
        quantity: useState(new Animated.Value(0))[0],
        unit: useState(new Animated.Value(0))[0],
    };

    const [Name, setName] = useState('');
    const [Quantity, setQuantity] = useState('');
    const [Unit, setUnit] = useState('');
    const [Price, setPrice] = useState('');
    const [isEdit, setisEdit] = useState(false);
    const [editItemId, seteditItemId] = useState(null);
    const [errors, setErrors] = useState({});
    const [focused, setFocused] = useState({ name: false, quantity: false, unit: false, price: false });
    const [fontSize, setFontSize] = useState(1);
    const [minQty, setMinQty] = useState(1);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);


    // Dropdown state
    const [open, setOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState('Grains');
    const [categories, setCategories] = useState([
        { label: 'Grains & Flours', value: 'Grains' },
        { label: 'Dairy', value: 'Dairy' },
        { label: 'Snacks', value: 'Snacks' },
        { label: 'Spices', value: 'Spices' },
        { label: 'Beverages', value: 'Beverages' },
        { label: 'Personal Care', value: 'Personal Care' },
        { label: 'Frozen', value: 'Frozen' },
        { label: 'Fresh Produce', value: 'Fresh Produce' },
        { label: 'Non-Food', value: 'Non-Food' },
        { label: 'Oils and Fats', value: 'Oils and Fats' },
        { label: 'Bakery', value: 'Bakery' },
        { label: 'Meat and Seafood', value: 'Meat and Seafood' },
        { label: 'Household Items', value: 'Household Items' },
    ]);

    const systemTheme = useColorScheme();
    const [themeMode, setThemeMode] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const loadItems = async () => {
                try {
                    const items = await getItems();
                    setdata(items);
                } catch (error) {
                    console.error('Error loading items:', error);
                }
            };

            loadItems();
            const loadSettings = async () => {
                const min = await getMinQuantity();
                setMinQty(min);
            };
            const loadTheme = async () => {
                const theme = await getTheme();
                setThemeMode(theme);
            };
            const loadFontSize = async () => {
                const size = await getFontSize();
                setFontSize(size);
            };
            loadTheme();
            loadFontSize();
            loadSettings();
        }, [])
    );

    const effectiveTheme = themeMode === 0 ? systemTheme : themeMode === 2 ? 'dark' : 'light';
    const isDarkMode = effectiveTheme === 'dark';

    const triggerShake = (field) => {
        Animated.sequence([
            Animated.timing(shakeAnim[field], { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim[field], { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim[field], { toValue: 6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim[field], { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim[field], { toValue: 3, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim[field], { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const validateForm = () => {
        const newErrors = {};

        if (!Name || Name.trim().length < 2) {
            newErrors.name = '* Item name must be at least 2 characters long';
            triggerShake('name');
        }

        if (!Quantity) {
            newErrors.quantity = '* Quantity is required';
            triggerShake('quantity');
        } else if (isNaN(Quantity)) {
            newErrors.quantity = '* Quantity must be a number';
            triggerShake('quantity');
        } else if (!Number.isInteger(Number(Quantity))) {
            newErrors.quantity = '* Quantity must be a whole number';
            triggerShake('quantity');
        } else if (Number(Quantity) <= 0) {
            newErrors.quantity = '* Quantity must be greater than 0';
            triggerShake('quantity');
        }

        if (!Unit || Unit.trim().length === 0) {
            newErrors.unit = '* Unit is required';
            triggerShake('unit');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getBorderColor = (field) => {
        if (errors[field]) return 'red';
        if (focused[field]) return 'green';
        return isDarkMode ? 'white' : 'black';
    };

    const handleAddItem = async () => {
        if (!validateForm()) return;

        const newItem = {
            id: uuid.v4(),
            name: Name,
            stock: Number(Quantity),
            unit: Unit,
            category: categoryValue,
            price: Price ? Number(Price) : null
        };

        try {
            // Add to AsyncStorage
            await addItem(newItem);
            // Update local state
            setdata([...data, newItem]);
            // Reset form
            setName('');
            setQuantity('');
            setUnit('');
            setPrice('');
            setisEdit(false);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleDeleteItem = (id) => {
        setItemToDelete(id);
        setConfirmVisible(true);
    };


    const handleEditItem = (item) => {
        setisEdit(true);
        setName(item.name);
        setQuantity(item.stock.toString());
        setUnit(item.unit);
        setCategoryValue(item.category || 'Grains');
        seteditItemId(item.id);
        setPrice(item.price ? item.price.toString() : '');
    };

    const handleUpdateItem = async () => {
        if (!validateForm()) return;

        const updatedItem = {
            id: editItemId,
            name: Name,
            stock: Number(Quantity),
            unit: Unit,
            category: categoryValue,
            price: Price ? Number(Price) : null
        };

        try {
            // Update in AsyncStorage
            await updateItem(updatedItem);
            // Update local state
            setdata(data.map(item =>
                item.id === editItemId ? updatedItem : item
            ));
            // Reset form
            setName('');
            setQuantity('');
            setUnit('');
            setPrice('');
            setisEdit(false);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
                setFocused({ name: false, quantity: false, unit: false, price: false });
                setErrors({});
                if (open) setOpen(false);
            }}>
                <View style={{ flex: 1, zIndex: 0 }}>

                    <ScrollView
                        contentContainerStyle={[styles.container, { paddingBottom: open ? 250 : 30, flexGrow: 1 }]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                    >
                        <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black', fontSize: fontSizePresets.title[fontSize] }]}>
                            {isEdit ? "Edit Item" : "Create Item"}
                        </Text>

                        <Animated.View style={{ transform: [{ translateX: shakeAnim.name }] }}>
                            <TextInput
                                placeholder="Enter Item Name"
                                placeholderTextColor={isDarkMode ? '#aaaaaa' : '#666666'}
                                value={Name}
                                onFocus={() => {
                                    setFocused({ name: true, quantity: false, unit: false, price: false });
                                    setErrors({});
                                    if (open) setOpen(false);
                                }}
                                onBlur={() => setFocused({ ...focused, name: false })}
                                onChangeText={setName}
                                style={[
                                    styles.input,
                                    {
                                        color: isDarkMode ? 'white' : 'black',
                                        borderColor: getBorderColor('name'),
                                        fontSize: fontSizePresets.input[fontSize]
                                    }
                                ]}
                            />
                        </Animated.View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        <Animated.View style={{ transform: [{ translateX: shakeAnim.quantity }] }}>
                            <TextInput
                                placeholder="Enter Quantity"
                                placeholderTextColor={isDarkMode ? '#aaaaaa' : '#666666'}
                                value={Quantity}
                                onFocus={() => {
                                    setFocused({ name: false, quantity: true, unit: false, price: false });
                                    setErrors({});
                                    if (open) setOpen(false);
                                }}
                                onBlur={() => setFocused({ ...focused, quantity: false })}
                                onChangeText={setQuantity}
                                style={[
                                    styles.input,
                                    {
                                        color: isDarkMode ? 'white' : 'black',
                                        borderColor: getBorderColor('quantity'),
                                        fontSize: fontSizePresets.input[fontSize]
                                    }
                                ]}
                                keyboardType="numeric"
                            />
                        </Animated.View>
                        {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

                        <Animated.View style={{ transform: [{ translateX: shakeAnim.unit }] }}>
                            <TextInput
                                placeholder="Enter Unit"
                                placeholderTextColor={isDarkMode ? '#aaaaaa' : '#666666'}
                                value={Unit}
                                onFocus={() => {
                                    setFocused({ name: false, quantity: false, unit: true, price: false });
                                    setErrors({});
                                    if (open) setOpen(false);
                                }}
                                onBlur={() => setFocused({ ...focused, unit: false })}
                                onChangeText={setUnit}
                                style={[
                                    styles.input,
                                    {
                                        color: isDarkMode ? 'white' : 'black',
                                        borderColor: getBorderColor('unit'),
                                        fontSize: fontSizePresets.input[fontSize]
                                    }
                                ]}
                            />
                        </Animated.View>
                        {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}

                        <Animated.View style={{ transform: [{ translateX: shakeAnim.quantity }] }}>
                            <TextInput
                                placeholder="Enter Price per Unit"
                                placeholderTextColor={isDarkMode ? '#aaaaaa' : '#666666'}
                                value={Price}
                                onFocus={() => {
                                    setFocused({ name: false, quantity: false, unit: false, price: true });
                                    setErrors({});
                                    if (open) setOpen(false);
                                }}
                                onBlur={() => setFocused({ ...focused, price: false })}
                                onChangeText={setPrice}
                                style={[
                                    styles.input,
                                    {
                                        color: isDarkMode ? 'white' : 'black',
                                        borderColor: getBorderColor('quantity'),
                                        fontSize: fontSizePresets.input[fontSize]
                                    }
                                ]}
                                keyboardType="numeric"
                            />
                        </Animated.View>
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}


                        <View style={{ zIndex: 1000, elevation: 1000, overflow: 'visible' }}>
                            <DropDownPicker
                                open={open}
                                value={categoryValue}
                                items={categories}
                                setOpen={setOpen}
                                setValue={setCategoryValue}
                                setItems={setCategories}
                                placeholder="Select Category"
                                listMode="SCROLLVIEW" // Changed from MODAL to SCROLLVIEW
                                dropDownDirection="BOTTOM" // Always opens downward
                                style={{
                                    borderColor: isDarkMode ? 'white' : 'black',
                                    backgroundColor: isDarkMode ? '#002b36' : '#fdf6e3',
                                    minHeight: 43,
                                }}
                                dropDownContainerStyle={{
                                    borderColor: isDarkMode ? 'white' : 'black',
                                    backgroundColor: isDarkMode ? '#002b36' : '#fdf6e3',
                                    maxHeight: categories.length * 42,
                                    overflow: "scroll",
                                    marginTop: 5,
                                    elevation: 1000,
                                    zIndex: 1000,
                                }}
                                textStyle={{
                                    color: isDarkMode ? 'white' : 'black',
                                    fontSize: fontSizePresets.input[fontSize],
                                    textAlign: 'left',
                                }}
                                placeholderStyle={{
                                    color: isDarkMode ? '#aaaaaa' : '#666666',
                                }}
                                listItemContainerStyle={{
                                    height: 40,
                                    justifyContent: 'center',
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: isDarkMode ? '#444444' : '#dddddd',
                                }}
                                listItemLabelStyle={{
                                    color: isDarkMode ? 'white' : 'black',
                                    textAlign: 'left',
                                    paddingLeft: 10,
                                }}
                                selectedItemContainerStyle={{
                                    backgroundColor: isDarkMode ? '#27ae60' : '#2ecc71',
                                }}
                                selectedItemLabelStyle={{
                                    fontWeight: 'bold',
                                    color: 'white',
                                }}
                                zIndex={1000}
                                zIndexInverse={1000}
                                scrollViewProps={{
                                    style: {
                                        maxHeight: 600,
                                    }
                                }}
                            />
                        </View>

                        <Pressable
                            style={[styles.button, { backgroundColor: isDarkMode ? '#27ae60' : 'green' }]}
                            onPress={isEdit ? handleUpdateItem : handleAddItem}
                        >
                            <Text style={[styles.btnText, { fontSize: fontSizePresets.button[fontSize] }]}>
                                {isEdit ? 'UPDATE ITEM' : 'ADD ITEM'}
                            </Text>
                        </Pressable>

                        <View style={styles.headingContainer}>
                            <Text style={[styles.headingText, {
                                color: isDarkMode ? 'white' : 'black',
                                fontSize: fontSizePresets.heading[fontSize]
                            }]}>
                                All Items in Stock
                            </Text>
                        </View>

                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.itemContainer,
                                    {
                                        backgroundColor: item.stock < minQty ? '#ffcccc' : '#D7F6BFFF',
                                    }
                                ]}>
                                    <View>
                                        <Text style={[
                                            styles.itemText,
                                            {
                                                fontSize: fontSizePresets.item[fontSize],
                                                color: 'black'
                                            }
                                        ]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[
                                            styles.itemSubText,
                                            {
                                                color: '#555555'
                                            }
                                        ]}>
                                            {item.category}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                        <Text style={[
                                            styles.itemText,
                                            {
                                                fontSize: fontSizePresets.item[fontSize],
                                                color: 'black'
                                            }
                                        ]}>
                                            {item.stock} {item.unit}
                                        </Text>
                                        <Pressable onPress={() => handleEditItem(item)}>
                                            <Text style={[
                                                styles.itemActionText,
                                                {
                                                    color: 'green'
                                                }
                                            ]}>
                                                Edit
                                            </Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteItem(item.id)}>
                                            <Text style={[
                                                styles.itemActionText,
                                                {
                                                    color: 'red'
                                                }
                                            ]}>
                                                Delete
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                            contentContainerStyle={{ gap: 7 }}
                            scrollEnabled={false}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={() => (
                                <Text style={{
                                    textAlign: 'center',
                                    marginTop: 20,
                                    color: isDarkMode ? '#ccc' : '#555',
                                    fontSize: 15,
                                }}>
                                    No items in inventory. Please add some items to manage your stock.
                                </Text>
                            )}

                        />
                        <Modal visible={confirmVisible} transparent animationType="fade">
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }}>
                                <View style={{
                                    backgroundColor: isDarkMode ? '#073642' : '#fff',
                                    padding: 20,
                                    borderRadius: 12,
                                    width: '80%',
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }}>
                                        Are you sure you want to delete this item?
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 20 }}>
                                        <Pressable
                                            onPress={async () => {
                                                try {
                                                    await deleteItem(itemToDelete); // remove from AsyncStorage
                                                    setdata(data.filter(item => item.id !== itemToDelete)); // update local
                                                } catch (err) {
                                                    console.error('Delete failed:', err);
                                                }
                                                setConfirmVisible(false);
                                                setItemToDelete(null);
                                            }}
                                            style={{ backgroundColor: 'red', padding: 10, borderRadius: 6 }}
                                        >
                                            <Text style={{ color: '#fff' }}>Yes, Delete</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => {
                                                setConfirmVisible(false);
                                                setItemToDelete(null);
                                            }}
                                            style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 6 }}
                                        >
                                            <Text style={{ color: '#000' }}>Cancel</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: '4%',
        paddingBottom: 30,
        gap: 15,
        flexGrow: 1,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1.2,
        borderRadius: 7,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 7,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    headingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 35,
        marginBottom: 20,
    },
    headingText: {
        fontWeight: 'bold',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
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
    itemActionText: {
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        marginTop: -13,
        marginBottom: 4,
        marginLeft: 4,
    },
});

export default CreateScreen;