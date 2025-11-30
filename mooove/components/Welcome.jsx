import React from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';

export default function Welcome({ navigation }) {
    return (
    <View style={styles.container}>
        <ImageBackground
        source={require('../assets/images/bg-welcome.png')}
        style={styles.bgimage}>
            <AppText style={styles.title}>Pesan Tiket di Mana Saja!</AppText>
            <AppText style={styles.subtitle}>Dengan menggunakan Mooove, kamu akan mendapatkan banyak keuntungan dan tidak perlu khawatir lagi untuk memesan tiket kereta api di mana saja.</AppText>
            <Image source={require('../assets/images/welcome-1.png')} style={styles.image}></Image>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('register')}>
                <AppText style={styles.textButton}>Lanjutkan</AppText>
            </TouchableOpacity>
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
    resizeMode: 'cover',
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 38,
    color: '#FFFFFF',
    marginTop: 70,
    marginHorizontal: 30,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#FFFFFF',
    marginTop: 40,
    marginHorizontal: 30,
    fontSize: 20,
  },
  image: {
    width: 400,
    height: 400,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 50,
  },
  textButton: {
    fontFamily: 'PlusJakartaSans_700Bold',
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#F31260',
    fontSize: 20
  }
});
