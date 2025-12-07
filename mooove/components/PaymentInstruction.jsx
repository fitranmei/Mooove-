import React, { useState, useEffect, useRef } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, Clipboard, Modal, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';
import AppText from './AppText';
import CustomAlert from './CustomAlert';
import { payBooking, updateBookingStatus, getBookingDetails, getScheduleSeats } from '../services/api';

export default function PaymentInstruction({ navigation, route }) {
    const isFocused = useIsFocused();
    const { bookingId, train, selectedClass, origin, destination, date, passengers, passengerDetails, allPassengers, selectedSeat, selectedCarriage, selectedPaymentMethod, reservedUntil } = route.params || {
        bookingId: null,
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
        selectedPaymentMethod: { name: 'BANK BCA', icon: 'card-outline' },
        reservedUntil: null
    };

    const [reservedUntilState, setReservedUntilState] = useState(reservedUntil);

    const calculateTimeLeft = (targetDate) => {
        if (!targetDate) return null; 
        
        let deadlineTime;
        if (typeof targetDate === 'string' && targetDate.includes(' ') && !targetDate.includes('T')) {
             deadlineTime = new Date(targetDate.replace(' ', 'T')).getTime();
        } else {
             deadlineTime = new Date(targetDate).getTime();
        }

        const now = new Date().getTime();
        const diff = Math.floor((deadlineTime - now) / 1000);
        return diff > 0 ? diff : 0;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(reservedUntil));
    const [isPaid, setIsPaid] = useState(false);
    const isPaidRef = useRef(isPaid);

    useEffect(() => {
        isPaidRef.current = isPaid;
    }, [isPaid]);

    useEffect(() => {
        if (isPaid) {
            setAlertConfig(prev => {
                if (prev.type === 'timeout' || prev.title === 'Waktu Habis') {
                    return { ...prev, visible: false };
                }
                return prev;
            });
        }
    }, [isPaid]);

    const [snapUrl, setSnapUrl] = useState(null);
    const [showWebView, setShowWebView] = useState(false);
    const showWebViewRef = useRef(showWebView);

    useEffect(() => {
        showWebViewRef.current = showWebView;
    }, [showWebView]);

    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', note: '', type: '', onConfirm: () => {}, onCancel: null });

    useEffect(() => {
        const fetchDetails = async () => {
            if (bookingId) {
                try {
                    const details = await getBookingDetails(bookingId);
                    
                    if (details) {
                        let freshReservedUntil = details.reserved_until || details.ReservedUntil;

                        if (!freshReservedUntil) {
                            const seats = details.Kursis || details.Seats || details.ketersediaan_kursis || details.SeatAvailabilities || [];
                            if (Array.isArray(seats) && seats.length > 0) {
                                freshReservedUntil = seats[0].reserved_until || seats[0].ReservedUntil;
                            }
                        }

                        if (!freshReservedUntil) {
                            const scheduleId = details.TrainScheduleID || details.train_schedule_id || details.JadwalID;
                            
                            const passengersList = details.Penumpangs || details.penumpangs || [];
                            const firstPassenger = passengersList.length > 0 ? passengersList[0] : null;
                            
                            let seatId = null;
                            if (firstPassenger) {
                                seatId = firstPassenger.seat_id || firstPassenger.SeatId;
                                if (!seatId && (firstPassenger.Kursi || firstPassenger.kursi)) {
                                    const k = firstPassenger.Kursi || firstPassenger.kursi;
                                    seatId = k.id || k.ID;
                                }
                            }

                            if (scheduleId && seatId) {
                                const seatsData = await getScheduleSeats(scheduleId);
                                
                                if (seatsData && seatsData.gerbongs) {
                                    for (const gerbong of seatsData.gerbongs) {
                                        if (gerbong.kursi) {
                                            const seatRecord = gerbong.kursi.find(s => (s.id == seatId) || (s.ID == seatId) || (s.seat_id == seatId));
                                            if (seatRecord) {
                                                freshReservedUntil = seatRecord.reserved_until || seatRecord.ReservedUntil;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (freshReservedUntil) {
                            setReservedUntilState(freshReservedUntil);
                            setTimeLeft(calculateTimeLeft(freshReservedUntil));
                        }

                        if (details.Status === 'paid' || details.status === 'paid') {
                            setIsPaid(true);
                        }
                    }
                } catch (e) {
                }
            }
        };
        fetchDetails();
    }, [bookingId]);

    useEffect(() => {
        const backAction = () => {
            navigation.navigate('MainApp', { screen: 'home' });
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    const timerRef = useRef(null);
    const hasShownTimeoutAlert = useRef(false);

    useEffect(() => {
        hasShownTimeoutAlert.current = false;
        isPaidRef.current = isPaid;
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isFocused || isPaid) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        setTimeLeft(calculateTimeLeft(reservedUntilState || reservedUntil));

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (isPaidRef.current) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return prev;
                }

                if (prev === null) return null;
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    
                    if (!isPaidRef.current && !showWebViewRef.current && !hasShownTimeoutAlert.current) {
                        hasShownTimeoutAlert.current = true;
                        setAlertConfig({
                            visible: true,
                            title: "Waktu Habis",
                            note: "Waktu pembayaran telah habis. Tiket otomatis dibatalkan.",
                            icon: "time-outline",
                            type: 'timeout',
                            confirmText: "OK",
                            onConfirm: () => {
                                setAlertConfig(prev => ({ ...prev, visible: false }));
                                navigation.navigate('MainApp', { screen: 'home' });
                            }
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [navigation, isPaid, isFocused]);

    const formatTime = (seconds) => {
        if (seconds === null) return { h: '--', m: '--', s: '--' };
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

    const dateObj = date ? new Date(date) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    let deadline;
    const targetDate = reservedUntilState || reservedUntil;
    
    if (targetDate) {
        if (typeof targetDate === 'string' && targetDate.includes(' ') && !targetDate.includes('T')) {
             deadline = new Date(targetDate.replace(' ', 'T'));
        } else {
             deadline = new Date(targetDate);
        }
    } else {
        deadline = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
    }

    const deadlineString = deadline.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + ' ' + deadline.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const pricePerPassenger = train.price || selectedClass.price || 180000;
    const passengerCount = parseInt(passengers) || 1;
    const totalPrice = pricePerPassenger * passengerCount;

    const formatCurrency = (amount) => {
        return `Rp${amount.toLocaleString('id-ID')}`;
    };

    const paymentCode = "202576384759091";

    const copyToClipboard = () => {
        Clipboard.setString(paymentCode);
        setAlertConfig({
            visible: true,
            title: "Disalin",
            note: "Kode pembayaran berhasil disalin.",
            icon: "checkmark-circle",
            confirmText: "OK",
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        });
    };

    const handlePayment = async () => {
        if (!bookingId) {
            setIsPaid(true);
            setAlertConfig({
                visible: true,
                title: "Berhasil",
                note: "Simulasi Pembayaran Berhasil (Mock)!",
                icon: "checkmark-circle",
                confirmText: "OK",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
            return;
        }
        
        setLoading(true);
        const paymentResult = await payBooking(bookingId);
        setLoading(false);

        if (paymentResult && paymentResult.redirect_url) {
            setSnapUrl(paymentResult.redirect_url);
            setShowWebView(true);
        } else {
            setAlertConfig({
                visible: true,
                title: "Gagal",
                note: "Gagal memulai pembayaran.",
                icon: "close-circle",
                confirmText: "OK",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
        }
    };

    const handleWebViewNavigationStateChange = async (navState) => {
        const { url } = navState;
        
        if (url.includes('status_code=200') || url.includes('transaction_status=settlement') || url.includes('transaction_status=capture')) {
            setShowWebView(false);
            setIsPaid(true);
            isPaidRef.current = true;
            hasShownTimeoutAlert.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            
            if (bookingId) {
                await updateBookingStatus(bookingId);
            }

            setAlertConfig({
                visible: true,
                title: "Pembayaran Berhasil",
                note: "Tiket anda telah terbit. Selamat menikmati perjalanan!",
                icon: "checkmark-circle",
                type: 'success',
                confirmText: "Lihat Tiket",
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    
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
                        passengerList = [{ name: 'Penumpang', id: '-', type: 'Dewasa', seat: `${selectedClass.type} ${selectedCarriage || 1} / ${selectedSeat || 'A'}` }];
                    }
        
                    navigation.navigate('TicketDetail', {
                        bookingCode: bookingId ? `BOOK-${bookingId}` : 'KJB75AU',
                        train: train || { name: 'Kereta', departureTime: '00:00', arrivalTime: '00:00' },
                        origin: origin || 'Asal',
                        destination: destination || 'Tujuan',
                        date: formattedDate,
                        allPassengers: passengerList,
                        passengers: passengerList,
                        selectedClass: selectedClass || { type: 'Ekonomi' }
                    });
                }
            });
        } else if (url.includes('status_code=202') || url.includes('transaction_status=deny') || url.includes('transaction_status=expire') || url.includes('transaction_status=cancel')) {
             setShowWebView(false);
        }
        
        if (url.includes('status_code=201') || url.includes('transaction_status=pending')) {
        }
    };

    useEffect(() => {
        if (!showWebView && bookingId) {
            const checkStatus = async () => {
                try {
                    const isTimeUp = timeLeft <= 0;

                    const details = await getBookingDetails(bookingId);
                    if (details && (details.Status === 'paid' || details.status === 'paid')) {
                        setIsPaid(true);
                        isPaidRef.current = true;
                        hasShownTimeoutAlert.current = true;
                        if (timerRef.current) clearInterval(timerRef.current);
                        
                        setAlertConfig(prev => {
                            if (prev.type === 'success') return prev;
                            return {
                                visible: true,
                                title: "Pembayaran Berhasil",
                                note: "Tiket anda telah terbit. Selamat menikmati perjalanan!",
                                icon: "checkmark-circle",
                                type: 'success',
                                confirmText: "Lihat Tiket",
                                onConfirm: () => {
                                    setAlertConfig(prev => ({ ...prev, visible: false }));
                                    
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
                                        passengerList = [{ name: 'Penumpang', id: '-', type: 'Dewasa', seat: `${selectedClass.type} ${selectedCarriage || 1} / ${selectedSeat || 'A'}` }];
                                    }
                        
                                    navigation.navigate('TicketDetail', {
                                        bookingCode: bookingId ? `BOOK-${bookingId}` : 'KJB75AU',
                                        train: train || { name: 'Kereta', departureTime: '00:00', arrivalTime: '00:00' },
                                        origin: origin || 'Asal',
                                        destination: destination || 'Tujuan',
                                        date: formattedDate,
                                        allPassengers: passengerList,
                                        passengers: passengerList,
                                        selectedClass: selectedClass || { type: 'Ekonomi' }
                                    });
                                }
                            };
                        });
                    } else {
                        if (isTimeUp && !isPaidRef.current && !hasShownTimeoutAlert.current) {
                             hasShownTimeoutAlert.current = true;
                             setAlertConfig({
                                visible: true,
                                title: "Waktu Habis",
                                note: "Waktu pembayaran telah habis. Tiket otomatis dibatalkan.",
                                icon: "time-outline",
                                type: 'timeout',
                                confirmText: "OK",
                                onConfirm: () => {
                                    setAlertConfig(prev => ({ ...prev, visible: false }));
                                    navigation.navigate('MainApp', { screen: 'home' });
                                }
                            });
                        }
                    }
                } catch (e) {
                }
            };
            checkStatus();
        }
    }, [showWebView]);

    const handleViewTicket = () => {
        if (!isPaid) {
            setAlertConfig({
                visible: true,
                title: "Belum Lunas",
                note: 'Mohon selesaikan pembayaran terlebih dahulu dan klik "Cek Pembayaran".',
                icon: "alert-circle",
                confirmText: "OK",
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
            });
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
        }

        navigation.navigate('TicketDetail', {
            bookingCode: bookingId ? `BOOK-${bookingId}` : 'KJB75AU',
            train: train || { name: 'Kereta', departureTime: '00:00', arrivalTime: '00:00' },
            origin: origin || 'Asal',
            destination: destination || 'Tujuan',
            date: formattedDate,
            allPassengers: passengerList,
            passengers: passengerList,
            selectedClass: selectedClass || { type: 'Ekonomi' }
        });
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
                <View style={styles.absoluteHeader}>
                    <TouchableOpacity onPress={() => navigation.navigate('MainApp', { screen: 'home' })} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <AppText style={styles.pageTitle}>Pembayaran</AppText>
                </View>

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
                <View style={styles.card}>
                    <View style={styles.deadlineBox}>
                        <AppText style={styles.deadlineLabel}>Selesaikan pembayaran sebelum</AppText>
                        <AppText style={styles.deadlineTime}>{deadlineString}</AppText>
                    </View>

                    <View style={styles.paymentDetailRow}>
                        <AppText style={styles.paymentLabel}>Total harga yang harus dibayar</AppText>
                        <AppText style={styles.paymentAmount}>{formatCurrency(totalPrice)}</AppText>
                    </View>

                </View>

                <View style={styles.card}>
                    <AppText style={styles.routeText}>{origin} {'>'} {destination}</AppText>
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
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#F31260" />
                    ) : (
                        <AppText style={[styles.primaryButtonText, { color: '#F31260' }]}>Bayar</AppText>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.primaryButton, { opacity: isPaid ? 1 : 0.5 }]} 
                    onPress={handleViewTicket}
                >
                    <AppText style={styles.primaryButtonText}>Lihat Tiket</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal
                visible={showWebView}
                onRequestClose={() => setShowWebView(false)}
                animationType="slide"
            >
                <View style={{ flex: 1, paddingTop: 40 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
                        <AppText style={{ fontSize: 18, fontWeight: 'bold' }}>Pembayaran</AppText>
                        <TouchableOpacity onPress={() => setShowWebView(false)}>
                            <Ionicons name="close" size={30} color="black" />
                        </TouchableOpacity>
                    </View>
                    {snapUrl && (
                        <WebView
                            source={{ uri: snapUrl }}
                            onNavigationStateChange={handleWebViewNavigationStateChange}
                            startInLoadingState={true}
                            renderLoading={() => <ActivityIndicator size="large" color="#F31260" style={{position: 'absolute', top: '50%', left: '50%'}} />}
                        />
                    )}
                </View>
            </Modal>

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