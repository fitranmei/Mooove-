import React, { useState, useEffect } from 'react';
import { View, ImageBackground, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';
import { getUserData } from '../services/authService';

export default function Home({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUserData();
            if (userData) {
                setUser(userData);
            }
        };
        loadUser();
    }, []);

    return (
        <View style={styles.container}>
            {/* banner di atas menampilkan username, logo */}
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.headerBg}
            >
                <Image source={require('../assets/images/logo-top.png')} style={styles.logoTop} />
                <View>
                    <AppText style={styles.welcome}>Selamat datang,</AppText>
                    <AppText style={styles.username}>{user ? user.fullname : 'Guest'}</AppText>
                </View>
            </ImageBackground>


            {/* option option fitur di home */}
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 50 }}
            >

                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('BookingForm')}>
                        <Image source={require('../assets/images/home-icon-1.png')} style={styles.icon} />
                        <View style={styles.textOption}>
                            <AppText style={styles.title}>Kereta Antar Kota</AppText>
                            <AppText style={styles.subtitle}>Pesan tiket kereta antar kota anda sekarang menjadi lebih mudah!</AppText>
                        </View>
                    </TouchableOpacity>

                <View style={styles.rowContainer}>
                    <View style={styles.smallOption}>
                        <Image source={require('../assets/images/home-icon-2.png')} style={styles.smallIcon} />
                        <AppText style={styles.titleSmall}>Jadwal Kereta</AppText>
                        <AppText style={styles.subtitleSmall}>Informasi jadwal perjalanan kereta</AppText>
                    </View>
                    <View style={styles.smallOption}>
                        <Image source={require('../assets/images/home-icon-4.png')} style={styles.smallIcon} />
                        <AppText style={styles.titleSmall}>Tarif Kereta</AppText>
                        <AppText style={styles.subtitleSmall}>Informasi tarif perjalanan kereta</AppText>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <TouchableOpacity style={styles.smallOption} onPress={() => navigation.navigate('About')}>
                        <Image source={require('../assets/images/home-icon-5.png')} style={styles.smallIcon} />
                        <AppText style={styles.titleSmall}>Tentang Mooove</AppText>
                        <AppText style={styles.subtitleSmall}>Mengenal tentang aplikasi Mooove</AppText>
                    </TouchableOpacity>
                </View>

                <Image source={require('../assets/images/home-banner.png')} style={{width: '90%', height: 150, resizeMode: 'contain', alignSelf: 'center', marginTop: 30}} />

            </ScrollView>

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerBg: {
        width: '100%',
        height: 220,
        justifyContent: 'center',
        paddingTop: 30,
    },
    logoTop: {
        width: 120,
        height: 40,
        marginLeft: 30,
        marginBottom: 20,
    },
    welcome: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 30,
    },
    username: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        marginLeft: 30,
    },
    
    scrollView: {
        marginTop: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#F31260',
        borderRadius: 16,
    },
    icon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginRight: 15,
    },
    textOption: {
        flex: 1,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
    },
    subtitle: {
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#A4A3A3',
        marginTop: 4,
        fontSize: 12,
        lineHeight: 18,
    },

    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 20,
    },
    smallOption: {
        width: '48%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#F31260',
        borderRadius: 16,
        padding: 15,
        alignItems: 'flex-start',
    },
    smallIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    titleSmall: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        marginBottom: 5,
    },
    subtitleSmall: {
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#A4A3A3',
        fontSize: 11,
        lineHeight: 16,
    },
});