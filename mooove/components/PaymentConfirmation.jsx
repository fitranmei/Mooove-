import React from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function PaymentConfirmation({ navigation, route }) {
    const { train, selectedClass, origin, destination, date, passengers, passengerDetails, selectedSeat, selectedCarriage, selectedPaymentMethod } = route.params || {
        train: { name: 'SINDANG MARGA S1', departureTime: '20:15', arrivalTime: '02:25', price: 180000 },
        selectedClass: { type: 'BISNIS', price: 180000 },
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1',
        passengerDetails: {},
        selectedSeat: '2D',
        selectedCarriage: 'Bisnis 1',
        selectedPaymentMethod: null
    };

    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const pricePerPassenger = train.price || selectedClass.price || 180000;
    const passengerCount = parseInt(passengers) || 1;
    const totalPrice = pricePerPassenger * passengerCount;

    const formatCurrency = (amount) => {
        return `Rp${amount.toLocaleString('id-ID')}`;
    };

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

            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
            >
                <AppText style={styles.sectionTitle}>Rincian Tiket</AppText>

                <View style={styles.card}>
                    <AppText style={styles.routeText}>{origin} (KPT) {'>'} {destination} (LLG)</AppText>
                    <View style={styles.trainInfoRow}>
                        <AppText style={styles.trainName}>{train.name}</AppText>
                        <View style={styles.dot} />
                        <AppText style={styles.trainClass}>{selectedClass.type}</AppText>
                    </View>
                    <AppText style={styles.dateTimeText}>{formattedDate}</AppText>
                    <AppText style={styles.timeText}>{train.departureTime} - {train.arrivalTime}</AppText>
                    <AppText style={styles.passengerCount}>{passengers} Dewasa</AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.cardTitle}>Detail Harga</AppText>
                    
                    <View style={styles.priceRow}>
                        <View>
                            <AppText style={styles.priceLabel}>TIKET KERETA</AppText>
                            <AppText style={styles.priceSubLabel}>{passengers}x Dewasa</AppText>
                        </View>
                        <AppText style={styles.priceValue}>{formatCurrency(totalPrice)}</AppText>
                    </View>

                    <View style={styles.totalBox}>
                        <AppText style={styles.totalLabel}>Total Harga</AppText>
                        <AppText style={styles.totalValue}>{formatCurrency(totalPrice)}</AppText>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.paymentMethodButton}
                    onPress={() => navigation.navigate('PaymentMethod', { ...route.params })}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         {selectedPaymentMethod ? (
                             <>
                                <Ionicons name={selectedPaymentMethod.icon} size={24} color="#0056b3" style={{ marginRight: 10 }} />
                                <AppText style={styles.paymentMethodText}>{selectedPaymentMethod.name}</AppText>
                             </>
                         ) : (
                             <AppText style={styles.paymentMethodText}>Pilih Metode Pembayaran</AppText>
                         )}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.payButton, 
                        selectedPaymentMethod ? styles.payButtonActive : styles.payButtonInactive
                    ]} 
                    onPress={() => {
                        if (!selectedPaymentMethod) {
                            alert('Mohon pilih metode pembayaran terlebih dahulu.');
                            return;
                        }
                        navigation.navigate('PaymentInstruction', { ...route.params });
                    }}
                    disabled={!selectedPaymentMethod}
                >
                    <AppText style={styles.payButtonText}>Bayar</AppText>
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
        position: 'absolute',
        top: 0,
        zIndex: 10,
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
        paddingHorizontal: 20,
        paddingTop: 130,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
        marginTop: 10,
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
        fontSize: 16,
        color: '#000',
        marginBottom: 15,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    priceSubLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
    },
    priceValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    totalBox: {
        backgroundColor: '#FFD1DC',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#F31260',
    },
    totalValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#F31260',
    },
    paymentMethodButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentMethodText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    payButton: {
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    payButtonActive: {
        backgroundColor: '#F31260',
    },
    payButtonInactive: {
        backgroundColor: '#FFB6C1',
    },
    payButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});