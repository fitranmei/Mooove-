import React from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';

export default function Login({ navigation }) {
    return (
    <View style={styles.container}>
        <ImageBackground
        source={require('../assets/images/bg-top.png')}
        style={styles.bgimage}>
          
          <Image source={require('../assets/images/logo-top.png')} style={styles.image}></Image>

          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <AppText style={styles.title}>Masuk</AppText>
            <AppText style={styles.subtitle}>Silahkan isi detail akun anda</AppText>

            <TextInput 
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
            />

            <TextInput 
              style={styles.input}
              placeholder="Nomor Telepon"
              keyboardType="phone-pad"
            />

            <TextInput 
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
            />

            <TouchableOpacity style={{marginHorizontal: 30}} onPress={() => navigation.navigate('register')}>
                <AppText style={{color: '#F31260', marginHorizontal:10, marginBottom:20}}>Lupa Password?</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
                <AppText style={styles.textButton}>Masuk</AppText>
            </TouchableOpacity>
            <AppText style={styles.text}>Belum punya akun? 
              <TouchableOpacity onPress={() => navigation.navigate('register')}>
                <AppText style={styles.link}> Buat Disini</AppText>
              </TouchableOpacity>
            </AppText>
          </View>

          </ScrollView>

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
