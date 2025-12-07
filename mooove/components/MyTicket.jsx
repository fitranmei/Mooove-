import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import AppText from './AppText';
import CustomAlert from './CustomAlert';
import { getUserBookings, cancelBooking } from '../services/api';

export default function MyTicket({ navigation }) {
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', note: '', onConfirm: () => {}, onCancel: () => {} });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchActiveTickets();
    }
  }, [isFocused]);

  const fetchActiveTickets = async () => {
    setLoading(true);
    try {
      const bookings = await getUserBookings();
      const activeBookings = bookings.filter(b => b.Status === 'paid' || b.Status === 'pending');
      
      const formatted = activeBookings.map(booking => {
        const schedule = booking.TrainSchedule || {};
        const kereta = schedule.kereta || {};
        const asal = schedule.asal || {};
        const tujuan = schedule.tujuan || {};
        
        const dateObj = new Date(schedule.tanggal || booking.CreatedAt);
        const dateStr = dateObj.toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        const formatTime = (isoString) => {
            if (!isoString) return '00:00';
            const d = new Date(isoString);
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        const passengerCount = booking.Penumpangs ? booking.Penumpangs.length : 1;
        const unitPrice = booking.TotalPrice / passengerCount;
        
        const getSeat = (p) => {
            if (p.kursi && typeof p.kursi === 'string') return p.kursi;
            if (p.nomor_kursi) return p.nomor_kursi;
            if (p.seat) return p.seat;

            if (p.Kursi && p.Kursi.nomor_kursi) return p.Kursi.nomor_kursi;
            if (p.Kursi && p.Kursi.NomorKursi) return p.Kursi.NomorKursi;
            if (p.kursi && typeof p.kursi === 'object' && p.kursi.nomor_kursi) return p.kursi.nomor_kursi;
            return '-';
        };

        const trainClassName = (schedule.kelas || schedule.Kelas || 'Ekonomi').toUpperCase();

        return {
          id: booking.ID.toString(),
          trainName: kereta.nama || 'Kereta Api',
          trainClass: trainClassName,
          trainNumber: kereta.kode || 'KA-001',
          origin: `${asal.nama || 'Origin'} (${asal.kode || 'ORG'})`,
          destination: `${tujuan.nama || 'Destination'} (${tujuan.kode || 'DST'})`,
          date: dateStr,
          departureTime: formatTime(schedule.waktu_berangkat),
          arrivalTime: formatTime(schedule.waktu_tiba),
          bookingCode: 'BOOK-' + booking.ID,
          status: booking.Status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran',
          rawStatus: booking.Status,
          totalPrice: booking.TotalPrice,
            rawData: {
                bookingCode: 'BOOK-' + booking.ID,
                bookingId: booking.ID,
                reservedUntil: (() => {
                    if (booking.reserved_until) return booking.reserved_until;
                    if (booking.ReservedUntil) return booking.ReservedUntil;
                    
                    if (booking.reserved_seats && booking.reserved_seats.length > 0) {
                        return booking.reserved_seats[0].reserved_until;
                    }

                    const seats = booking.Kursis || booking.Seats || booking.ketersediaan_kursis || [];
                    if (Array.isArray(seats) && seats.length > 0) {
                        return seats[0].reserved_until || seats[0].ReservedUntil;
                    }
                    return null;
                })(),
                train: { 
                    name: kereta.nama, 
                    departureTime: formatTime(schedule.waktu_berangkat), 
                    arrivalTime: formatTime(schedule.waktu_tiba),
                    price: unitPrice 
                },
                selectedClass: { type: trainClassName, price: unitPrice },
                origin: asal.nama || 'Origin',
                destination: tujuan.nama || 'Destination',
                date: schedule.tanggal || booking.CreatedAt, 
                passengers: passengerCount,
                allPassengers: (booking.Penumpangs || []).map((p, index) => {
                    let seatStr = '-';
                    
                    if (p.kursi && typeof p.kursi === 'string') seatStr = p.kursi;
                    else if (p.nomor_kursi) seatStr = p.nomor_kursi;
                    else if (p.seat) seatStr = p.seat;
                    
                    const k = p.Kursi || p.kursi;
                    if (seatStr === '-' && k) {
                         const num = k.nomor_kursi || k.NomorKursi;
                         
                         if (num) {
                             const g = k.Gerbong || k.gerbong;
                             if (g) {
                                 const className = (g.Kelas || g.kelas || trainClassName).toUpperCase();
                                 const carriageNum = g.NomorGerbong || g.nomor_gerbong || '';
                                 seatStr = `${className} ${carriageNum} / ${num}`;
                             } else {
                                 seatStr = num;
                             }
                         }
                    }
                    
                    if (seatStr === '-') {
                        const seats = booking.Kursis || booking.Seats || [];
                        if (seats[index]) {
                            const s = seats[index];
                            const num = s.nomor_kursi || s.NomorKursi || s.seat_number || s.SeatNumber;
                            if (num) {
                                 const carriage = s.Gerbong ? (s.Gerbong.nama || s.Gerbong.Nama) : 
                                                  (s.gerbong ? (s.gerbong.nama || s.gerbong.nomor_gerbong) : null);
                                 
                                 if (carriage) {
                                     seatStr = `${trainClassName} ${carriage} / ${num}`;
                                 } else {
                                     seatStr = num;
                                 }
                            }
                        }
                    }
    
                    return {
                        name: p.nama,
                        id: p.no_identitas,
                        type: 'Dewasa',
                        seat: seatStr
                    };
                }),
                selectedSeat: (() => {
                    const seats = booking.Kursis || booking.Seats || [];
                    if (seats.length > 0) {
                        const s = seats[0];
                        if (s.nomor_kursi) return s.nomor_kursi;
                        if (s.NomorKursi) return s.NomorKursi;
                        if (s.seat_number) return s.seat_number;
                    }
                    
                    const passengers = booking.Penumpangs || [];
                    if (passengers.length > 0) {
                        const p = passengers[0];
                        const k = p.Kursi || p.kursi;
                        if (k) {
                            if (k.nomor_kursi) return k.nomor_kursi;
                            if (k.NomorKursi) return k.NomorKursi;
                        }
                        if (p.seat) return p.seat;
                        if (p.nomor_kursi) return p.nomor_kursi;
                    }
                    
                    return '-';
                })(),
                selectedCarriage: (() => {
                    const seats = booking.Kursis || booking.Seats || [];
                    if (seats.length > 0) {
                        const s = seats[0];
                        const g = s.Gerbong || s.gerbong;
                        if (g) return g.nama || g.nomor_gerbong || g.NomorGerbong || '1';
                    }

                    const passengers = booking.Penumpangs || [];
                    if (passengers.length > 0) {
                        const p = passengers[0];
                        const k = p.Kursi || p.kursi;
                        if (k) {
                            const g = k.Gerbong || k.gerbong;
                            if (g) return g.nama || g.nomor_gerbong || g.NomorGerbong || '1';
                        }
                    }
                    
                    return '1';
                })(),
                selectedPaymentMethod: { name: 'Online Payment', icon: 'card-outline' }
            }
        };
      });
      
      setActiveTickets(formatted);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (bookingId) => {
    setAlertConfig({
        visible: true,
        title: "Apakah anda yakin ingin membatalkan tiket?",
        note: "Uang akan masuk ke metode pembayaran anda dalam kurun waktu 2x24 jam.",
        cancelText: "Batal",
        confirmText: "Lanjutkan",
        onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        onConfirm: async () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            setLoading(true);
            const result = await cancelBooking(bookingId);
            if (result) {
                setAlertConfig({
                    visible: true,
                    title: "Tiket berhasil dibatalkan",
                    icon: "checkmark-circle",
                    confirmText: "OK",
                    onConfirm: () => {
                        setAlertConfig(prev => ({ ...prev, visible: false }));
                        fetchActiveTickets();
                    }
                });
            } else {
                setAlertConfig({
                    visible: true,
                    title: "Gagal membatalkan tiket",
                    icon: "close-circle",
                    confirmText: "OK",
                    onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
                });
                setLoading(false);
            }
        }
    });
  };

  const handlePressTicket = (item) => {
    if (item.rawStatus === 'paid') {
        navigation.navigate('TicketDetail', item.rawData);
    }
  };

  const handlePay = (item) => {
    navigation.push('PaymentInstruction', {
      ...item.rawData,
      _timestamp: Date.now()
    });
  };

    const renderTicket = ({ item }) => (
    <TouchableOpacity 
        activeOpacity={item.rawStatus === 'paid' ? 0.7 : 1} 
        onPress={() => handlePressTicket(item)}
        disabled={item.rawStatus !== 'paid'}
        style={{ marginBottom: 20 }}
    >
        <View style={[styles.ticketCard, { marginBottom: 0 }]}>
        <View style={[styles.cardHeader, item.rawStatus === 'pending' && { backgroundColor: '#808080' }]}>
            <AppText style={styles.bookingLabel}>Kode Pemesanan <AppText style={styles.bookingCode}>{item.bookingCode}</AppText></AppText>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.rawStatus === 'pending' && (
                    <TouchableOpacity 
                        style={{backgroundColor: '#FFF3CD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8}}
                        onPress={() => handlePay(item)}
                    >
                        <AppText style={{color: '#856404', fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold'}}>Bayar</AppText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item.id)}>
                    <AppText style={[styles.cancelText, item.rawStatus === 'pending' && { color: '#808080' }]}>Batalkan Tiket</AppText>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.cardBody}>
            <View style={styles.trainInfoRow}>
            <View>
                <AppText style={styles.trainName}>{item.trainName}</AppText>
                <AppText style={styles.trainDetails}>{item.trainClass}</AppText>
            </View>
            <Image source={require('../assets/images/logo-top.png')} style={styles.cardLogo} /> 
            </View>

            <View style={styles.divider} />

            <View style={styles.timelineContainer}>
            <View style={styles.timelineLineContainer}>
                <View style={styles.timelineDotOutline} />
                <View style={styles.timelineLine} />
                <View style={styles.timelineDotFilled} />
            </View>

            <View style={styles.stationsContainer}>
                <View style={styles.stationItem}>
                    <AppText style={styles.time}>{item.departureTime}</AppText>
                    <View style={{marginLeft: 15}}>
                        <AppText style={styles.stationName}>{item.origin}</AppText>
                        <AppText style={styles.date}>{item.date}</AppText>
                    </View>
                </View>

                <View style={[styles.stationItem, {marginTop: 25}]}>
                    <AppText style={styles.time}>{item.arrivalTime}</AppText>
                    <View style={{marginLeft: 15}}>
                        <AppText style={styles.stationName}>{item.destination}</AppText>
                        <AppText style={styles.date}>{item.date}</AppText>
                    </View>
                </View>
            </View>
            </View>
        </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <ImageBackground
            source={require('../assets/images/bg-top.png')}
            style={styles.headerBg}
        >
            <View style={styles.headerContent}>
                <AppText style={styles.pageTitle}>Tiket Saya</AppText>
            </View>
        </ImageBackground>

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

        <View style={styles.contentContainer}>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                    <ActivityIndicator size="large" color="#F31260" />
                </View>
            ) : (
                <FlatList
                    data={activeTickets}
                    renderItem={renderTicket}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <AppText style={{ color: '#888' }}>Tidak ada tiket aktif.</AppText>
                        </View>
                    }
                />
            )}
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
        height: 180,
        paddingTop: 60,
        justifyContent: 'flex-start',
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
        color: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        marginTop: -40, 
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
    },
    serviceSection: {
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
    },
    serviceItem: {
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#F31260',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    serviceText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
        color: '#000',
    },
    
    ticketCard: {
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: 'transparent',
    },
    cardHeader: {
        backgroundColor: '#F31260',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    bookingLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#FFFFFF',
    },
    bookingCode: {
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
        color: '#F31260',
    },
    cardBody: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    trainInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 4,
    },
    trainDetails: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    cardLogo: {
        width: 80,
        height: 30,
        resizeMode: 'contain',
    },
    divider: {
        height: 1,
        backgroundColor: '#E4E4E7',
        borderStyle: 'dashed', 
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderRadius: 1,
        marginBottom: 15,
    },
    timelineContainer: {
        flexDirection: 'row',
    },
    timelineLineContainer: {
        alignItems: 'center',
        marginRight: 15,
        paddingTop: 5,
    },
    timelineDotOutline: {
        width: 12,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#F31260',
        backgroundColor: '#fff',
    },
    timelineDotFilled: {
        width: 12,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F31260',
    },
    timelineLine: {
        width: 1.5,
        height: 45,
        backgroundColor: '#F31260',
        marginVertical: 2,
    },
    stationsContainer: {
        flex: 1,
    },
    stationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    time: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        width: 45,
    },
    stationName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 2,
    },
    date: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#A4A3A3',
    }
});
