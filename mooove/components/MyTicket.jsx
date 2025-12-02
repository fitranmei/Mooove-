import React from 'react';
import { View, ImageBackground, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';

export default function MyTicket({ navigation }) {
  
  const activeTickets = [
    {
      id: '1',
      trainName: 'BUKIT SERELO S9',
      trainClass: 'BISNIS',
      trainNumber: 'No Kereta EKO 2',
      origin: 'KERTAPATI (KPT)',
      destination: 'LUBUKLINGGAU (LLG)',
      date: 'Selasa 25 Mei 2025',
      departureTime: '09:00',
      arrivalTime: '15:25',
      bookingCode: 'KJB75AU',
      status: 'Lunas'
    }
  ];

  const renderTicket = ({ item }) => (
    <View style={styles.ticketCard}>
      <View style={styles.cardHeader}>
        <AppText style={styles.bookingLabel}>Kode Pemesanan <AppText style={styles.bookingCode}>{item.bookingCode}</AppText></AppText>
        <TouchableOpacity style={styles.cancelButton}>
          <AppText style={styles.cancelText}>Batalkan Tiket</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.trainInfoRow}>
          <View>
            <AppText style={styles.trainName}>{item.trainName}</AppText>
            <AppText style={styles.trainDetails}>{item.trainClass}  <AppText style={{color: '#A4A3A3'}}>{item.trainNumber}</AppText></AppText>
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
                    <AppText style={styles.date}>Selasa    {item.date.split(' ').slice(1).join(' ')}</AppText>
                 </View>
              </View>

              <View style={[styles.stationItem, {marginTop: 25}]}>
                 <AppText style={styles.time}>{item.arrivalTime}</AppText>
                 <View style={{marginLeft: 15}}>
                    <AppText style={styles.stationName}>{item.destination}</AppText>
                    <AppText style={styles.date}>Selasa    {item.date.split(' ').slice(1).join(' ')}</AppText>
                 </View>
              </View>
           </View>
        </View>
      </View>
    </View>
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

        <View style={styles.contentContainer}>
            <View style={styles.serviceSection}>
                <AppText style={styles.sectionTitle}>Tiket dan Layanan Saya</AppText>
                <View style={styles.serviceItem}>
                    <View style={styles.iconContainer}>
                        <Image source={require('../assets/images/myticket.png')} style={styles.serviceIcon} />
                    </View>
                    <AppText style={styles.serviceText}>Antar Kota</AppText>
                </View>
            </View>

            <FlatList
                data={activeTickets}
                renderItem={renderTicket}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
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
