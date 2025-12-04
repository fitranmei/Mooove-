import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { getUserData } from '../services/authService';

export default function PassengerData({ navigation, route }) {
    const { train, selectedClass, origin, destination, date, passengers } = route.params || {
        // data mockup
        train: { name: 'SINDANG MARGA S1', departureTime: '20:15', arrivalTime: '02:25' },
        selectedClass: { type: 'BISNIS' },
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1'
    };

    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUserData();
            if (userData) {
                setUser(userData);
                setName(userData.fullname);
                setEmail(userData.email);
                if (userData.phone) setPhone(userData.phone);
            }
        };
        loadUser();
    }, []);

    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

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
                    <AppText style={styles.pageTitle}>Pembelian Tiket</AppText>
                </View>
            </ImageBackground>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <AppText style={styles.sectionTitle}>Data Penumpang</AppText>

                {/* Trip Summary Card */}
                <View style={styles.card}>
                    <AppText style={styles.routeText}>{origin} (KPT) {'>'} {destination} (LLG)</AppText>
                    <View style={styles.trainInfoRow}>
                        <AppText style={styles.trainName}>{train.name}</AppText>
                        <View style={styles.dot} />
                        <AppText style={styles.trainClass}>{selectedClass.type}</AppText>
                    </View>
                    <AppText style={styles.dateTimeText}>{formattedDate}</AppText>
                    <AppText style={styles.timeText}>{train.departureTime} - {train.arrivalTime}</AppText>
                    <AppText style={styles.passengerCount}>{passengers}</AppText>
                </View>

                {/* Passenger Details Card */}
                <View style={styles.card}>
                    <AppText style={styles.cardTitle}>Detail Penumpang</AppText>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>NAMA</AppText>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nama Lengkap"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>EMAIL</AppText>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>NO. TELPON</AppText>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Nomor Telepon"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <AppText style={styles.infoText}>Informasi mengenai tiket akan dikirim ke kontak tertera</AppText>
                    </View>
                </View>

                <TouchableOpacity style={styles.outlineButton}>
                    <AppText style={styles.outlineButtonText}>Tambah Penumpang Lain</AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton} onPress={() => {
                    navigation.navigate('SeatSelection', {
                        train,
                        selectedClass,
                        origin,
                        destination,
                        date,
                        passengers,
                        passengerDetails: { name, email, phone }
                    });
                }}>
                    <AppText style={styles.primaryButtonText}>Lanjutkan</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        marginTop: -20,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
        marginTop: 30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    routeText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 5,
    },
    trainInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#888',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#F31260',
        marginHorizontal: 8,
    },
    trainClass: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#888',
    },
    dateTimeText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    timeText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },
    passengerCount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    cardTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
        color: '#000',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    input: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 5,
    },
    infoBox: {
        backgroundColor: '#FFD1DC', // Light pink
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
    },
    infoText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#F31260',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#F31260',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    outlineButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#F31260',
    },
    primaryButton: {
        backgroundColor: '#F31260',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    primaryButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});