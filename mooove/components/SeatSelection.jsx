import React, { useState } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function SeatSelection({ navigation, route }) {
    const { train, selectedClass, origin, destination, date, passengers, passengerDetails, allPassengers } = route.params || {
        train: { name: 'SINDANG MARGA S1', departureTime: '20:15', arrivalTime: '02:25' },
        selectedClass: { type: 'BISNIS' },
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1',
        passengerDetails: {},
        allPassengers: []
    };

    const totalPassengers = parseInt(passengers);
    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const initialSeats = [
        { row: 1, seats: [1, 1, 0, 0] },
        { row: 2, seats: [1, 1, 0, 2] },
        { row: 3, seats: [1, 1, 1, 1] },
        { row: 4, seats: [1, 0, 1, 1] },
        { row: 5, seats: [1, 1, 1, 0] },
        { row: 6, seats: [0, 0, 1, 1] },
        { row: 7, seats: [1, 1, 0, 0] },
    ];

    const [seats, setSeats] = useState(initialSeats);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedCarriage, setSelectedCarriage] = useState('Bisnis 1');

    const carriages = ['Bisnis 1', 'Bisnis 2', 'Bisnis 3'];
    const columns = ['A', 'B', 'C', 'D'];

    const handleSeatPress = (rowIndex, colIndex) => {
        const seatStatus = seats[rowIndex].seats[colIndex];
        if (seatStatus === 1) return;

        const rowNum = seats[rowIndex].row;
        const colName = columns[colIndex];
        const seatId = `${rowNum}${colName}`;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length < totalPassengers) {
                setSelectedSeats([...selectedSeats, seatId]);
            } else {
                // Optional: Alert user that max seats selected
                // Alert.alert('Info', `Anda hanya dapat memilih ${totalPassengers} kursi.`);
            }
        }
    };

    const renderSeat = (status, rowIndex, colIndex) => {
        const rowNum = seats[rowIndex].row;
        const colName = columns[colIndex];
        const seatId = `${rowNum}${colName}`;
        const isSelected = selectedSeats.includes(seatId);

        let seatStyle = styles.seatAvailable;
        if (status === 1) seatStyle = styles.seatOccupied;
        if (isSelected) seatStyle = styles.seatSelected;

        return (
            <TouchableOpacity 
                key={colIndex} 
                style={[styles.seat, seatStyle]}
                onPress={() => handleSeatPress(rowIndex, colIndex)}
                disabled={status === 1}
            >
                {isSelected && (
                    <AppText style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>
                        {selectedSeats.indexOf(seatId) + 1}
                    </AppText>
                )}
            </TouchableOpacity>
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
                <AppText style={styles.sectionTitle}>Kursi</AppText>

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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carriageScroll}>
                    {carriages.map((carriage, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.carriageButton, 
                                selectedCarriage === carriage && styles.carriageButtonSelected
                            ]}
                            onPress={() => setSelectedCarriage(carriage)}
                        >
                            <AppText style={[
                                styles.carriageText,
                                selectedCarriage === carriage && styles.carriageTextSelected
                            ]}>{carriage}</AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.seatAvailable]} />
                        <AppText style={styles.legendText}>Tersedia</AppText>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.seatOccupied]} />
                        <AppText style={styles.legendText}>Terisi</AppText>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.seatSelected]} />
                        <AppText style={styles.legendText}>Dipilih</AppText>
                    </View>
                </View>

                <View style={styles.seatLayoutContainer}>
                    <View style={styles.columnHeaders}>
                        <View style={{ width: 30 }} /> 
                        <View style={styles.columnGroup}>
                            <AppText style={styles.colHeader}>A</AppText>
                            <AppText style={styles.colHeader}>B</AppText>
                        </View>
                        <View style={{ width: 40 }} /> 
                        <View style={styles.columnGroup}>
                            <AppText style={styles.colHeader}>C</AppText>
                            <AppText style={styles.colHeader}>D</AppText>
                        </View>
                    </View>

                    {seats.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.seatRow}>
                            <AppText style={styles.rowLabel}>{row.row}</AppText>
                            <View style={styles.seatGroup}>
                                {renderSeat(row.seats[0], rowIndex, 0)}
                                {renderSeat(row.seats[1], rowIndex, 1)}
                            </View>
                            <View style={{ width: 40 }} /> 
                            <View style={styles.seatGroup}>
                                {renderSeat(row.seats[2], rowIndex, 2)}
                                {renderSeat(row.seats[3], rowIndex, 3)}
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={[
                    styles.primaryButton,
                    selectedSeats.length !== totalPassengers && { backgroundColor: '#ccc' }
                ]} 
                disabled={selectedSeats.length !== totalPassengers}
                onPress={() => {
                    navigation.navigate('PaymentConfirmation', {
                        train,
                        selectedClass,
                        origin,
                        destination,
                        date,
                        passengers,
                        passengerDetails,
                        allPassengers,
                        selectedSeats,
                        selectedCarriage
                    });
                }}>
                    <AppText style={styles.primaryButtonText}>
                        {selectedSeats.length === totalPassengers ? 'Lanjutkan' : `Pilih ${totalPassengers - selectedSeats.length} Kursi Lagi`}
                    </AppText>
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
        marginBottom: 10,
        marginTop: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
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
        marginBottom: 2,
    },
    trainInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
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
        marginBottom: 5,
    },
    passengerCount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
    seatLayoutContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    columnHeaders: {
        flexDirection: 'row',
        marginBottom: 10,
        width: '100%',
        justifyContent: 'center',
    },
    columnGroup: {
        flexDirection: 'row',
        width: 100,
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    colHeader: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        width: 40,
        textAlign: 'center',
    },
    seatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
        justifyContent: 'center',
    },
    rowLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        width: 30,
        textAlign: 'center',
    },
    seatGroup: {
        flexDirection: 'row',
        width: 100,
        justifyContent: 'space-between',
    },
    seat: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatAvailable: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F31260',
    },
    seatOccupied: {
        backgroundColor: '#D9D9D9',
    },
    seatSelected: {
        backgroundColor: '#F31260',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    legendBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 8,
    },
    legendText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 12,
        color: '#000',
    },
    carriageScroll: {
        marginBottom: 20,
    },
    carriageButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 10,
        backgroundColor: '#FFFFFF',
    },
    carriageButtonSelected: {
        borderColor: '#F31260',
        backgroundColor: '#FFD1DC',
    },
    carriageText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#888',
    },
    carriageTextSelected: {
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
