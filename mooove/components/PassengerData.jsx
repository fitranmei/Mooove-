import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
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

    const totalPassengers = parseInt(passengers);
    const [user, setUser] = useState(null);
    
    const [passengerList, setPassengerList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassenger, setNewPassenger] = useState({ name: '', id: '' });

    const handleAddPassenger = () => {
        if (newPassenger.name && newPassenger.id) {
            if (passengerList.length < totalPassengers) {
                setPassengerList([...passengerList, newPassenger]);
                setNewPassenger({ name: '', id: '' });
                setModalVisible(false);
            }
        }
    };

    const removePassenger = (index) => {
        const newList = [...passengerList];
        newList.splice(index, 1);
        setPassengerList(newList);
    };

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUserData();
            if (userData) {
                setUser(userData);
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
                    <AppText style={styles.passengerCount}>{passengers} Orang</AppText>
                </View>

                {/* Booker Account Details Card */}
                <View style={styles.card}>
                    <AppText style={styles.cardTitle}>Detail Akun Pemesan</AppText>
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>NAMA</AppText>
                        <AppText style={styles.passengerName}>{user?.fullname || '-'}</AppText>
                    </View>
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>EMAIL</AppText>
                        <AppText style={styles.passengerName}>{user?.email || '-'}</AppText>
                    </View>
                     <View style={styles.infoBox}>
                        <AppText style={styles.infoText}>Informasi mengenai tiket akan dikirim ke email tertera</AppText>
                    </View>
                </View>

                {/* Passenger Slots */}
                {[...Array(totalPassengers)].map((_, index) => {
                    const passenger = passengerList[index];
                    return (
                        <View key={index} style={styles.card}>
                            <AppText style={styles.cardTitle}>Detail Penumpang {index + 1}</AppText>
                            
                            {passenger ? (
                                <View>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <View style={{flex: 1}}>
                                            <View style={styles.inputGroup}>
                                                <AppText style={styles.label}>NAMA</AppText>
                                                <AppText style={styles.passengerName}>{passenger.name}</AppText>
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <AppText style={styles.label}>NOMOR IDENTITAS (KTP)</AppText>
                                                <AppText style={styles.passengerName}>{passenger.id}</AppText>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => removePassenger(index)}>
                                            <Ionicons name="trash-outline" size={24} color="#F31260" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.outlineButton} onPress={() => setModalVisible(true)}>
                                    <AppText style={styles.outlineButtonText}>Isi Data Penumpang</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                <TouchableOpacity 
                    style={[styles.primaryButton, { opacity: passengerList.length === totalPassengers ? 1 : 0.5 }]} 
                    disabled={passengerList.length !== totalPassengers}
                    onPress={() => {
                        const allPassengers = passengerList.map(p => ({ ...p, type: 'Dewasa' }));
                        
                        navigation.navigate('SeatSelection', {
                            train,
                            selectedClass,
                            origin,
                            destination,
                            date,
                            passengers,
                            allPassengers
                        });
                    }}
                >
                    <AppText style={styles.primaryButtonText}>Lanjutkan</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Passenger Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>Tambah Penumpang</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <AppText style={styles.inputLabel}>Nama Lengkap</AppText>
                        <TextInput 
                            style={styles.input}
                            placeholder="Masukkan nama lengkap"
                            value={newPassenger.name}
                            onChangeText={(text) => setNewPassenger({...newPassenger, name: text})}
                        />

                        <AppText style={styles.inputLabel}>Nomor Identitas (KTP)</AppText>
                        <TextInput 
                            style={styles.input}
                            placeholder="Masukkan No. KTP"
                            value={newPassenger.id}
                            onChangeText={(text) => setNewPassenger({...newPassenger, id: text})}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleAddPassenger}>
                            <AppText style={styles.saveButtonText}>Simpan</AppText>
                        </TouchableOpacity>
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
        backgroundColor: '#FFD1DC',
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
    passengerName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    passengerId: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666',
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
    inputLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: '#F31260',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});