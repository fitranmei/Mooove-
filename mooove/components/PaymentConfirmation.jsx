import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import CustomAlert from './CustomAlert';
import { createBooking } from '../services/api';

export default function PaymentConfirmation({ navigation, route }) {
    const { train, selectedClass, origin, destination, date, passengers, passengerDetails, selectedSeat, selectedCarriage, allPassengers, selectedSeats, selectedSeatIds } = route.params || {
        train: { name: 'SINDANG MARGA S1', departureTime: '20:15', arrivalTime: '02:25', price: 180000 },
        selectedClass: { type: 'BISNIS', price: 180000 },
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1',
        passengerDetails: {},
        selectedSeat: '2D',
        selectedCarriage: 'Bisnis 1',
        allPassengers: [],
        selectedSeats: [],
        selectedSeatIds: []
    };

    const [loading, setLoading] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', note: '', onConfirm: () => {}, onCancel: null });

    useEffect(() => {
        const backAction = () => {
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

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

    const handlePayment = async () => {
        setLoading(true);
        
        const payload = {
            schedule_id: selectedClass.scheduleId,
            seat_ids: selectedSeatIds.filter(id => id !== null),
            penumpangs: allPassengers.map(p => ({
                nama: p.name,
                no_identitas: p.id,
            })),
            total_harga: totalPrice
        };

        if (payload.seat_ids.length !== payload.penumpangs.length) {
            setLoading(false);
            setAlertConfig({
                visible: true,
                title: "Kesalahan Data",
                note: "Data kursi dan penumpang tidak sesuai.",
                icon: "alert-circle",
                confirmText: "OK",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
            return;
        }

        const booking = await createBooking(payload);

        if (!booking || !booking.booking_id) {
            setLoading(false);
            setAlertConfig({
                visible: true,
                title: "Gagal",
                note: "Gagal membuat pesanan. Silakan coba lagi.",
                icon: "close-circle",
                confirmText: "OK",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
            return;
        }

        setBookingId(booking.booking_id);

        let reservedUntil = booking.reserved_until || booking.ReservedUntil;
        if (!reservedUntil && booking.reserved_seats && booking.reserved_seats.length > 0) {
            reservedUntil = booking.reserved_seats[0].reserved_until;
        }

        navigation.navigate('PaymentInstruction', { 
            ...route.params, 
            bookingId: booking.booking_id, 
            status: 'pending',
            reservedUntil: reservedUntil
        });
        setLoading(false);
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
                style={styles.headerBg}
                imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            >
                <View style={styles.headerContent}>
                    <View style={{ width: 28 }} /> 
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
                    style={[styles.payButton, styles.payButtonActive]} 
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <AppText style={styles.payButtonText}>Bayar Sekarang</AppText>
                    )}
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