import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AppText from './AppText';

export default function TicketDetail({ route, navigation }) {
    // Fallback data if not passed
    const { 
        bookingCode = 'KJB75AU',
        train = { name: 'SINDANG MARGA S1', departureTime: '09:00', arrivalTime: '15:25' },
        origin = 'KERTAPATI (KPT)',
        destination = 'LUBUKLINGGAU (LLG)',
        date = 'Selasa 25 Mei 2025',
        allPassengers,
        passengers: paramPassengers,
        selectedClass = { type: 'BISNIS' }
    } = route.params || {};

    // Use allPassengers if available, otherwise use paramPassengers if it is an array
    const initialPassengers = allPassengers || (Array.isArray(paramPassengers) ? paramPassengers : []);

    const [passengers, setPassengers] = useState(initialPassengers);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPassenger, setSelectedPassenger] = useState(null);

    const handlePrintTicket = (passenger) => {
        setSelectedPassenger(passenger);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
             {/* Header */}
            <View style={styles.headerContainer}>
                 <ImageBackground
                    source={require('../assets/images/bg-top.png')} 
                    style={styles.headerBg}
                    imageStyle={{ opacity: 0.8 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <AppText style={styles.pageTitle}>Detail Tiket</AppText>
                    </View>
                </ImageBackground>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Logo & Code */}
                <View style={styles.topSection}>
                    <Image source={require('../assets/images/logo-red.png')} style={styles.logo} resizeMode="contain" />
                    <View style={styles.codeContainer}>
                        <AppText style={styles.codeLabel}>Kode Pemesanan</AppText>
                        <AppText style={styles.codeValue}>{bookingCode}</AppText>
                    </View>
                </View>

                {/* Warning Box */}
                <View style={styles.warningBox}>
                    <AppText style={styles.warningText}>
                        Anda wajib menunjukan e-boarding pass pada saat boarding dan pemeriksaan di atas kereta
                    </AppText>
                </View>

                {/* Trip Details Card */}
                <View style={styles.card}>
                    {/* Departure */}
                    <View style={styles.tripRow}>
                        <View style={styles.timeCol}>
                            <AppText style={styles.timeText}>{train.departureTime}</AppText>
                        </View>
                        <View style={styles.graphicCol}>
                            <View style={styles.pillOutline} />
                            <View style={styles.line} />
                        </View>
                        <View style={styles.stationCol}>
                            <AppText style={styles.stationText}>{origin}</AppText>
                            <AppText style={styles.dateText}>{date}</AppText>
                        </View>
                    </View>

                    {/* Arrival */}
                    <View style={styles.tripRow}>
                        <View style={styles.timeCol}>
                            <AppText style={styles.timeText}>{train.arrivalTime}</AppText>
                        </View>
                        <View style={styles.graphicCol}>
                            <View style={styles.pillFilled} />
                        </View>
                        <View style={styles.stationCol}>
                            <AppText style={styles.stationText}>{destination}</AppText>
                            <AppText style={styles.dateText}>{date}</AppText>
                        </View>
                    </View>

                    <View style={styles.trainInfo}>
                        <Ionicons name="train-outline" size={24} color="#F31260" />
                        <View style={{marginLeft: 10}}>
                            <AppText style={styles.trainName}>{train.name}</AppText>
                            <AppText style={styles.trainClass}>{selectedClass.type}</AppText>
                        </View>
                        <AppText style={styles.duration}>6j 10m</AppText>
                    </View>
                </View>

                {/* Passengers */}
                <AppText style={styles.sectionTitle}>Penumpang</AppText>
                {passengers.map((p, index) => (
                    <View key={index} style={styles.passengerRow}>
                        <View style={{flex: 1}}>
                            <AppText style={styles.passengerLabel}>Penumpang 0{index + 1}</AppText>
                            <AppText style={styles.passengerName}>{p.name}</AppText>
                            <AppText style={styles.passengerId}>{p.id}</AppText>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                             <TouchableOpacity style={styles.printButton} onPress={() => handlePrintTicket(p)}>
                                <AppText style={styles.printButtonText}>Cetak Tiket</AppText>
                             </TouchableOpacity>
                             <AppText style={styles.passengerType}>{p.type}</AppText>
                             <AppText style={styles.seatInfo}>{p.seat}</AppText>
                        </View>
                    </View>
                ))}
                
                <View style={{height: 40}} />
            </ScrollView>

            {/* Boarding Pass Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>E-Boarding Pass</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedPassenger && (
                            <View style={{alignItems: 'center'}}>
                                <View style={styles.barcodeContainer}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', height: 80, overflow: 'hidden'}}>
                                        {[...Array(50)].map((_, i) => (
                                            <View key={i} style={{
                                                width: Math.random() > 0.5 ? 6 : 2,
                                                height: 80,
                                                backgroundColor: '#000',
                                                marginRight: 3
                                            }} />
                                        ))}
                                    </View>
                                </View>
                                
                                <AppText style={styles.passengerNameLarge}>{selectedPassenger.name}</AppText>
                                <AppText style={styles.passengerIdLarge}>{selectedPassenger.id}</AppText>
                                
                                <View style={styles.seatBadge}>
                                    <AppText style={styles.seatBadgeText}>{selectedPassenger.seat}</AppText>
                                </View>

                                <AppText style={styles.boardingNote}>
                                    Tunjukkan barcode ini kepada petugas saat boarding.
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        height: 100,
        backgroundColor: '#F31260',
    },
    headerBg: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        paddingBottom: 15,
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 30,
    },
    codeContainer: {
        alignItems: 'flex-end',
    },
    codeLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#888',
    },
    codeValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    barcodeContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    warningBox: {
        backgroundColor: '#FFD1DC',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    warningText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#F31260',
        textAlign: 'center',
    },
    card: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        marginBottom: 25,
    },
    tripRow: {
        flexDirection: 'row',
        minHeight: 80,
    },
    timeCol: {
        width: 70,
        alignItems: 'flex-end',
        paddingRight: 15,
    },
    graphicCol: {
        width: 20,
        alignItems: 'center',
        paddingTop: 6,
    },
    stationCol: {
        flex: 1,
        paddingLeft: 15,
    },
    timeText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 15,
        color: '#000',
        lineHeight: 24,
    },
    dateText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    stationText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        lineHeight: 20,
    },
    pillOutline: {
        width: 16,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#F31260',
        backgroundColor: '#FFF',
        zIndex: 1,
    },
    pillFilled: {
        width: 16,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F31260',
        zIndex: 1,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#F31260',
        marginVertical: -2,
    },
    trainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    trainClass: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#888',
    },
    duration: {
        marginLeft: 'auto',
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#888',
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        marginBottom: 15,
    },
    passengerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 15,
        marginBottom: 15,
    },
    passengerLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 10,
        color: '#888',
        marginBottom: 2,
    },
    passengerName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 2,
    },
    passengerId: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#888',
    },
    printButton: {
        borderWidth: 1,
        borderColor: '#F31260',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 5,
    },
    printButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 10,
        color: '#F31260',
    },
    passengerType: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 10,
        color: '#888',
        textAlign: 'right',
    },
    seatInfo: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 10,
        color: '#888',
        textAlign: 'right',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#F31260',
        borderRadius: 12,
        borderStyle: 'dashed',
        marginTop: 10,
    },
    addButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#F31260',
        marginLeft: 10,
    },
    passengerIdLarge: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    passengerNameLarge: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginTop: 10,
        marginBottom: 5,
        textAlign: 'center',
    },
    seatBadge: {
        backgroundColor: '#F31260',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    seatBadgeText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
    boardingNote: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
    },
});
