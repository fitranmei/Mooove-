import React from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';

export default function Account({ navigation }) {
    return (
    <View style={styles.container}>
        <ImageBackground
        source={require('../assets/images/bg-top.png')}
        style={styles.bgimage}>
          
          <AppText style={styles.welcome}>Akun Saya</AppText>

          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>

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
    height: 220,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#E4E4E7',
    paddingBottom: 50,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: '#000000',
    marginTop: 25,
    marginHorizontal: 30,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#000000',
    marginTop: 10,
    marginHorizontal: 30,
    fontSize: 18,
  },
      welcome: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 33,
        color: '#FFFFFF',
        marginBottom: 40,
        marginTop: 100,
        marginLeft: 30,
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
  },

  featureSection: {
    flexDirection: 'row',
    marginHorizontal: 10,

},
feature: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 15,
},

featureIcon: {
    width: 55,
    height: 55,
},

featureText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#000000',
    marginTop: 4,
    fontSize: 14,
},
});
