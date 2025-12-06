import React from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function About({ navigation }) {
    const teamMembers = [
        { name: 'Andreas Calvin'},
        { name: 'Charlistio Aditirta Wijaya'},
        { name: 'Fitran Husein'},
        { name: 'Mevika Vania'},
        { name: 'Stanley Gilbert Lionardi'},
    ];

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.headerBg}
                imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <AppText style={styles.pageTitle}>Tentang Mooove</AppText>
                </View>
            </ImageBackground>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/images/logo-red.png')} style={styles.logo} resizeMode="contain" />
                    <AppText style={styles.version}>Versi 1.0.0</AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.description}>
                        Mooove adalah aplikasi pemesanan tiket kereta api yang dirancang untuk memudahkan perjalanan Anda. 
                        Dengan antarmuka yang ramah pengguna dan fitur yang lengkap, kami berkomitmen untuk memberikan 
                        pengalaman pemesanan tiket yang cepat, aman, dan nyaman.
                    </AppText>
                    
                    <AppText style={styles.description}>
                        Nikmati kemudahan memesan tiket kereta antar kota, cek jadwal, dan berbagai metode pembayaran 
                        yang fleksibel. Perjalanan Anda dimulai di sini, bersama Mooove.
                    </AppText>
                </View>

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Tim Pengembang</AppText>
                    <View style={styles.teamGrid}>
                        {teamMembers.map((member, index) => (
                            <View key={index} style={styles.teamCard}>
                                <View style={styles.avatarContainer}>
                                    <Ionicons name="person" size={24} color="#FFF" />
                                </View>
                                <AppText style={styles.memberName}>{member.name}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
                
                <View style={{height: 40}} />
            </ScrollView>

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerBg: {
        width: '100%',
        height: 120,
        paddingTop: 50,
        justifyContent: 'flex-start',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    pageTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        color: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logo: {
        width: 150,
        height: 50,
        marginBottom: 10,
    },
    version: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#888',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    description: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 15,
        textAlign: 'justify',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    contactText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#333',
        marginLeft: 15,
    },
    teamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    teamCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F31260',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    memberName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    memberRole: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 10,
        color: '#888',
        textAlign: 'center',
    },
});