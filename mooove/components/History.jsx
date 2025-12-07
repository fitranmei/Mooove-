import React, { useState, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, SectionList, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AppText from './AppText';
import { getUserBookings } from '../services/api';

export default function History({ navigation }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchBookings();
    }
  }, [isFocused]);

  const fetchBookings = async () => {
    setLoading(true);
    const bookings = await getUserBookings();
    
    const grouped = {};
    bookings.forEach(booking => {
      const date = new Date(booking.CreatedAt).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      const trainName = booking.TrainSchedule?.kereta?.nama || 'Kereta Api';
      const origin = booking.TrainSchedule?.asal?.kode || 'KPT';
      const destination = booking.TrainSchedule?.tujuan?.kode || 'LLG';
      
      grouped[date].push({
        id: booking.ID.toString(),
        bookingCode: 'BOOK-' + booking.ID,
        status: booking.Status === 'paid' ? 'Lunas' : (booking.Status === 'cancelled' ? 'Batal' : 'Menunggu'),
        trainName: trainName,
        origin: origin,
        destination: destination,
        price: `Rp ${booking.TotalPrice.toLocaleString('id-ID')}`,
        type: booking.TrainSchedule?.kelas || 'Ekonomi'
      });
    });

    const sections = Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date]
    }));

    setHistoryData(sections);
    setLoading(false);
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <AppText style={styles.sectionHeaderText}>{title}</AppText>
    </View>
  );

  const renderTicket = ({ item }) => {
    const isCancelled = item.status === 'Batal';
    const isPending = item.status === 'Menunggu';
    
    let headerBgColor = '#FFC8DD';
    let statusBadgeBg = '#C8E6C9';
    let statusTextColor = '#2E7D32';
    let bookingLabelColor = '#000';
    let bookingCodeColor = '#000';

    if (isCancelled) {
        headerBgColor = '#EAEAEA';
        statusBadgeBg = '#FF8A80';
        statusTextColor = '#D32F2F';
    } else if (isPending) {
        headerBgColor = '#F3F0FA';
        statusBadgeBg = '#D8CCF1';
        statusTextColor = '#5E35B1';
        bookingLabelColor = '#5E35B1';
        bookingCodeColor = '#000';
    }

    const statusText = item.status === 'Menunggu' ? 'Menunggu Pembayaran' : item.status;

    return (
        <View style={styles.ticketCard}>
            <View style={[styles.cardHeader, { backgroundColor: headerBgColor }]}>
                <View>
                    <AppText style={[styles.bookingLabel, isPending && { color: bookingLabelColor }]}>Kode Pemesanan</AppText>
                    <AppText style={[styles.bookingCode, isPending && { color: bookingCodeColor }]}>{item.bookingCode}</AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
                    <AppText style={[styles.statusText, { color: statusTextColor }]}>{statusText}</AppText>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.trainRow}>
                    <View style={styles.iconContainer}>
                        <Image source={require('../assets/images/home-icon-1.png')} style={{width:40, height:40}} />
                    </View>
                    <AppText style={styles.trainName}>{item.trainName}</AppText>
                </View>

                <View style={styles.routeRow}>
                    <View style={styles.routeContainer}>
                        <AppText style={styles.routeText}>{item.origin}</AppText>
                        <Ionicons name="arrow-forward" size={16} color="#888" style={{ marginHorizontal: 8 }} />
                        <AppText style={styles.routeText}>{item.destination}</AppText>
                    </View>
                    <View>
                        <AppText style={styles.priceLabel}>Total Harga</AppText>
                        <AppText style={styles.priceText}>{item.price}</AppText>
                    </View>
                </View>
            </View>
        </View>
    );
  };

  return (
    <View style={styles.container}>
        <ImageBackground
            source={require('../assets/images/bg-top.png')}
            style={styles.headerBg}
            imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
            <View style={styles.headerContent}>
                <AppText style={styles.pageTitle}>Riwayat</AppText>
            </View>
        </ImageBackground>

        <View style={styles.contentContainer}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F31260" />
                </View>
            ) : (
                <SectionList
                    sections={historyData}
                    keyExtractor={(item, index) => item.id + index}
                    renderItem={renderTicket}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <AppText style={{ color: '#888' }}>Belum ada riwayat pemesanan.</AppText>
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
        overflow: 'hidden',
    },
    sectionHeader: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionHeaderText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#555',
    },
    ticketCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bookingLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#666',
    },
    bookingCode: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
    },
    cardBody: {
        padding: 16,
    },
    trainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    routeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: '#555',
    },
    priceLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 10,
        color: '#888',
        textAlign: 'right',
    },
    priceText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#007AFF',
    },
});

