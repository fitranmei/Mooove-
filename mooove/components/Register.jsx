import React, { useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';
import { register } from '../services/authService';

export default function Register({ navigation }) {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullname || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Mohon isi semua kolom');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            await register(fullname, email, password);
            Alert.alert('Sukses', 'Registrasi berhasil! Silahkan login.', [
                { text: 'OK', onPress: () => navigation.navigate('login') }
            ]);
        } catch (error) {
            Alert.alert('Gagal', error.error || 'Terjadi kesalahan saat registrasi');
        } finally {
            setLoading(false);
        }
    };

    return (
    <View style={styles.container}>
        <ImageBackground
        source={require('../assets/images/bg-top.png')}
        style={styles.bgimage}>
          <Image source={require('../assets/images/logo-top.png')} style={styles.image}></Image>

          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
            <AppText style={styles.title}>Buat Akun</AppText>
            <AppText style={styles.subtitle}>Silahkan isi detail akun anda</AppText>

            <TextInput 
              style={styles.input}
              placeholder="Nama Lengkap"
              value={fullname}
              onChangeText={setFullname}
            />

            <TextInput 
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput 
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />

            <TextInput 
              style={styles.input}
              placeholder="Konfirmasi Password"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
              
            
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <AppText style={styles.textButton}>Daftar</AppText>
                )}
            </TouchableOpacity>
            <AppText style={styles.text}>Sudah punya akun? 
              <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <AppText style={styles.link} onPress={() => navigation.navigate('login')}> Login Disini</AppText>
              </TouchableOpacity>
            </AppText>
          </View>

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
