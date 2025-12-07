import React from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';

const { width } = Dimensions.get('window');

export default function Welcome({ navigation }) {
    return (
    <View style={styles.container}>
        <ImageBackground
        source={require('../assets/images/bg-welcome.png')}
        style={styles.bgimage}>
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.content}>
                    <AppText style={styles.title}>Pesan Tiket di Mana Saja!</AppText>
                    <AppText style={styles.subtitle}>Dengan menggunakan Mooove, kamu akan mendapatkan banyak keuntungan dan tidak perlu khawatir lagi untuk memesan tiket kereta api di mana saja.</AppText>
                    <Image source={require('../assets/images/welcome-1.png')} style={styles.image}></Image>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('register')}>
                    <AppText style={styles.textButton}>Lanjutkan</AppText>
                </TouchableOpacity>
            </SafeAreaView>
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
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 50,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: 50,
    marginHorizontal: 25,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#FFFFFF',
    marginTop: 25,
    marginHorizontal: 25,
    fontSize: 16,
  },
  image: {
    width: width * 0.85,
    height: width * 0.85,
    alignSelf: 'center',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 25,
    marginBottom: 80,
    paddingVertical: 14,
    borderRadius: 50,
  },
  textButton: {
    fontFamily: 'PlusJakartaSans_700Bold',
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#F31260',
    fontSize: 18
  }
});
