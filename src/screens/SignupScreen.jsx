import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, } from 'react-native';
import { saveUserToStorage } from '../lib/storage';

const SignupScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const logoSource = require('../../assets/app-logo.png');

  const [form, setForm] = useState({
    name: '',
    shop: '',
    address: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState({
    name: false,
    shop: false,
    address: false,
    phone: false,
  });

  // Shake animations
  const shakeAnim = {
    name: useState(new Animated.Value(0))[0],
    shop: useState(new Animated.Value(0))[0],
    address: useState(new Animated.Value(0))[0],
    phone: useState(new Animated.Value(0))[0],
  };

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

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^[A-Za-z ]{3,30}$/.test(form.name.trim())) {
      newErrors.name = '* Name should be alphabetic (3–30 letters only)';
      triggerShake('name');
    }

    if (!/^[A-Za-z ]{3,30}$/.test(form.shop.trim())) {
      newErrors.shop = '* Shop name should be alphabetic (3–30 letters only)';
      triggerShake('shop');
    }

    if (!/^[A-Za-z0-9 ,.-]{5,100}$/.test(form.address.trim())) {
      newErrors.address = '* Enter a valid address (min 5 characters)';
      triggerShake('address');
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = '* Enter a valid Indian phone number';
      triggerShake('phone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSignup = async () => {
    if (!validateForm()) return;

    const trimmed = {
      name: form.name.trim(),
      shop: form.shop.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
    };

    await saveUserToStorage(trimmed);
    navigation.replace('Home');
  };

  const getBorderColor = (field) => {
    if (errors[field]) return 'red';
    if (focused[field]) return 'green';
    return isDark ? 'white' : 'black';
  };

  const themedInput = (fieldKey, placeholder, keyboardType = 'default') => (
    <>
      <Animated.View style={{ transform: [{ translateX: shakeAnim[fieldKey] }] }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={form[fieldKey]}
          onFocus={() => {
            setFocused({ name: false, shop: false, address: false, phone: false, [fieldKey]: true });
            setErrors({});
          }}
          onBlur={() => setFocused({ ...focused, [fieldKey]: false })}
          onChangeText={(text) => handleChange(fieldKey, text)}
          style={[
            styles.input,
            {
              color: isDark ? '#fff' : '#000',
              backgroundColor: isDark ? '#002b36' : '#fdf6e3',
              borderColor: getBorderColor(fieldKey),
            },
          ]}
          keyboardType={keyboardType}
          autoCapitalize={fieldKey === 'phone' ? 'none' : 'words'}
        />
      </Animated.View>
      {errors[fieldKey] && (
        <Text style={styles.errorText}>{errors[fieldKey]}</Text>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setErrors({});
          setFocused({ name: false, shop: false, address: false, phone: false });
        }}
      >
        <View style={[styles.container, { backgroundColor: isDark ? '#002b36' : '#fdf6e3' }]}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>KiranaKart</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#fff' : '#000' }]}>Signup to KiranaKart</Text>

          {themedInput('name', 'Full Name')}
          {themedInput('shop', 'Shop Name')}
          {themedInput('address', 'Address')}
          {themedInput('phone', 'Phone Number', 'numeric')}

          <Pressable style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Create Account</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '6%',
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 5,
    marginTop: -40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    marginLeft: 6,
    marginBottom: 3,
    marginTop: -9,
  },
});
