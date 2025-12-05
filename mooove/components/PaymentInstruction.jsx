import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, Clipboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function PaymentInstruction({ navigation, route }) {
    const { train, selectedClass, origin, destination, date, passengers, passengerDetails, allPassengers, selectedSeat, selectedCarriage, selectedPaymentMethod } = route.params || {
        // Mock data
        train: { name: 'SINDANG MARGA S1', departureTime: '20:15', arrivalTime: '02:25', price: 180000 },
        selectedClass: { type: 'BISNIS', price: 180000 },
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1',
        passengerDetails: {},
        allPassengers: [],
        selectedSeat: '2D',
        selectedCarriage: 'Bisnis 1',
        selectedPaymentMethod: { name: 'BANK BCA', icon: 'card-outline' }
    };

    const [timeLeft, setTimeLeft] = useState(2 * 60 * 60 - 1); // 2 hours in seconds
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0'),
        };
    };

    const time = formatTime(timeLeft);

    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // deadline bayar 2 jam
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 2);
    const deadlineString = deadline.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + ' ' + deadline.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // hitung harga total
    const pricePerPassenger = train.price || selectedClass.price || 180000;
    const passengerCount = parseInt(passengers) || 1;
    const totalPrice = pricePerPassenger * passengerCount;

    const formatCurrency = (amount) => {
        return `Rp${amount.toLocaleString('id-ID')}`;
    };

    const paymentCode = "202576384759091"; // kode mockup rekening bayar

    const copyToClipboard = () => {
        Clipboard.setString(paymentCode);
        alert('Kode pembayaran disalin!');
    };

    const handleCheckPayment = () => {
        setIsPaid(true);
        alert('Pembayaran Berhasil Dikonfirmasi!');
    };

    const handleViewTicket = () => {
        if (!isPaid) {
            alert('Mohon selesaikan pembayaran terlebih dahulu dan klik "Cek Pembayaran".');
            return;
        }
        
        let passengerList = [];
        
        if (allPassengers && allPassengers.length > 0) {
            passengerList = allPassengers.map((p, i) => ({
                name: p.name,
                id: p.id,
                type: p.type || 'Dewasa',
                seat: `${selectedClass.type} ${selectedCarriage || 1} / ${route.params.selectedSeats ? route.params.selectedSeats[i] : selectedSeat}`
            }));
        } else if (passengerDetails && Object.keys(passengerDetails).length > 0) {
             passengerList = Object.values(passengerDetails).map((p, i) => ({
                name: p.name || 'Penumpang',
                id: p.idNumber || '-',
                type: 'Dewasa',
                seat: `${selectedClass.type} ${selectedCarriage || 1} / ${selectedSeat || 'A'}`
            }));
        } else {
            passengerList = [{ name: 'MELVIN MULIAWAN', id: 'mmgacorkang@gmail.com', type: 'Dewasa', seat: 'Ekonomi 3 / 9 A' }];
        }

        navigation.navigate('TicketDetail', {
            bookingCode: 'KJB75AU',
            train,
            origin,
            destination,
            date: formattedDate,
            allPassengers: passengerList,
            passengers: passengerList,
            selectedClass
        });
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.headerBg}
                imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            >
                <View style={{ height: 80 }} /> 

                <View style={styles.timerContainer}>
                    <AppText style={styles.timerLabel}>Waktu yang tersisa</AppText>
                    <View style={styles.timerBoxContainer}>
                        <View style={styles.timerBox}>
                            <AppText style={styles.timerText}>{time.h}</AppText>
                        </View>
                        <AppText style={styles.timerSeparator}>:</AppText>
                        <View style={styles.timerBox}>
                            <AppText style={styles.timerText}>{time.m}</AppText>
                        </View>
                        <AppText style={styles.timerSeparator}>:</AppText>
                        <View style={styles.timerBox}>
                            <AppText style={styles.timerText}>{time.s}</AppText>
                        </View>
                    </View>
                </View>
            </ImageBackground>

            <ScrollView 
                style={{ flex: 1, zIndex: 5 }}
                contentContainerStyle={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
            >
                {/* Payment Info Card */}
                <View style={styles.card}>
                    <View style={styles.deadlineBox}>
                        <AppText style={styles.deadlineLabel}>Selesaikan pembayaran sebelum</AppText>
                        <AppText style={styles.deadlineTime}>{deadlineString}</AppText>
                    </View>

                    <View style={styles.paymentDetailRow}>
                        <AppText style={styles.paymentLabel}>Total harga yang harus dibayar</AppText>
                        <AppText style={styles.paymentAmount}>{formatCurrency(totalPrice)}</AppText>
                    </View>

                    <AppText style={styles.codeLabel}>Kode Pembayaran</AppText>
                    <View style={styles.codeRow}>
                        <AppText style={styles.paymentCode}>{paymentCode}</AppText>
                        <TouchableOpacity onPress={copyToClipboard}>
                            <Ionicons name="copy-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.methodRow}>
                        {selectedPaymentMethod && (
                             <Ionicons name={selectedPaymentMethod.icon} size={24} color="#0056b3" style={{ marginRight: 10 }} />
                        )}
                        <AppText style={styles.methodName}>
                            {selectedPaymentMethod ? `VIRTUAL ACCOUNT ${selectedPaymentMethod.name}` : 'VIRTUAL ACCOUNT'}
                        </AppText>
                    </View>
                </View>

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
                    <AppText style={styles.passengerCount}>{passengers} Dewasa</AppText>
                </View>

                <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F31260', marginBottom: 10 }]} 
                    onPress={handleCheckPayment}
                >
                    <AppText style={[styles.primaryButtonText, { color: '#F31260' }]}>Cek Pembayaran</AppText>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.primaryButton, { opacity: isPaid ? 1 : 0.5 }]} 
                    onPress={handleViewTicket}
                >
                    <AppText style={styles.primaryButtonText}>Lihat Tiket</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Absolute Header for Back Button */}
            <View style={styles.absoluteHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <AppText style={styles.pageTitle}>Lakukan Pembayaran</AppText>
            </View>

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
        height: 300,
        paddingTop: 50,
        justifyContent: 'flex-start',
        position: 'absolute',
        top: 0,
    },
    absoluteHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        zIndex: 100,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    backButton: {
        marginRight: 15,
    },
    pageTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        color: '#FFFFFF',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    timerBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
        color: '#000',
    },
    timerSeparator: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        marginHorizontal: 8,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 280,
        paddingBottom: 40,
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
    deadlineBox: {
        backgroundColor: '#FFD1DC',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    deadlineLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#F31260',
        marginBottom: 5,
    },
    deadlineTime: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#F31260',
    },
    paymentDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    paymentLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        flex: 1,
    },
    paymentAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    codeLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 5,
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    paymentCode: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
        color: '#000',
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
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