import React, { useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import CustomAlert from './CustomAlert';
import { login } from '../services/authService';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', note: '', onConfirm: () => {}, onCancel: null });

    const handleLogin = async () => {
        if (!email || !password) {
            setAlertConfig({
                visible: true,
                title: 'Mohon isi email dan password',
                icon: 'alert-circle',
                confirmText: 'OK',
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigation.navigate('MainApp');
        } catch (error) {
            setAlertConfig({
                visible: true,
                title: 'Login Gagal',
                note: error.error || 'Email atau password salah',
                icon: 'close-circle',
                confirmText: 'Coba Lagi',
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CustomAlert 
                visible={alertConfig.visible}
                title={alertConfig.title}
                note={alertConfig.note}
                cancelText={alertConfig.cancelText}
                confirmText={alertConfig.confirmText}
                icon={alertConfig.icon}
                onCancel={alertConfig.onCancel}
                onConfirm={alertConfig.onConfirm}
            />
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.bgimage}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <Image source={require('../assets/images/logo-top.png')} style={styles.image} />

                        <View style={styles.card}>
                            <AppText style={styles.title}>Masuk</AppText>
                            <AppText style={styles.subtitle}>Silahkan isi detail akun anda</AppText>

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <AppText style={styles.textButton}>Masuk</AppText>
                                )}
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <AppText style={styles.text}>Belum punya akun?</AppText>
                                <TouchableOpacity onPress={() => navigation.navigate('register')}>
                                    <AppText style={styles.link}> Buat Disini</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <StatusBar style="auto" />
            </ImageBackground>
        </View>
    );
}
    
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgimage: {
    flex: 1,
    width: '100%',
    height: '25%',
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingBottom: 50,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 33,
    color: '#F31260',
    marginTop: 20,
    marginHorizontal: 30,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#000000',
    marginTop: 10,
    marginHorizontal: 30,
    fontSize: 18,
  },
  image: {
    width: 150,
    height: 50,
    marginTop: 60,
    marginBottom : 20,
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#F31260',
    marginHorizontal: 30,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 50,
  },
  textButton: {
    fontFamily: 'PlusJakartaSans_700Bold',
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: 20
  },
  input: {
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 50,
    marginHorizontal: 30,
    paddingHorizontal: 20,
    height: 50,
    fontSize: 16,
  },
  passwordContainer: {
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 50,
    marginHorizontal: 30,
    paddingHorizontal: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  text: {
    color: '#000000',
    textAlign: 'center',
    paddingTop: 5,
    marginHorizontal: 5,
    fontSize: 18,
  },
  link: {
    color: '#F31260',
    fontFamily: 'PlusJakartaSans_700Bold',
    paddingTop: 5,
    marginHorizontal: 5,
    fontSize: 18,
  }
});
