import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, FlatList, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from './AppText';
import { getStations } from '../services/api';

export default function BookingForm({ navigation }) {
    const [stations, setStations] = useState([]);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [date, setDate] = useState(new Date());
    const [passengers, setPassengers] = useState('1');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStations = async () => {
            const data = await getStations();
            if (data && data.length > 0) {
                setStations(data);
            }
        };
        fetchStations();
    }, []);

    const handleSwap = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

    const openStationModal = (field) => {
        setActiveField(field);
        setSearchQuery('');
        setModalVisible(true);
    };

    const selectStation = (station) => {
        if (activeField === 'origin') {
            setOrigin(station);
        } else {
            setDestination(station);
        }
        setModalVisible(false);
    };

    const filteredStations = stations.filter(station => 
        station.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.kode.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <AppText style={styles.pageTitle}>Kereta Antar Kota</AppText>
                </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
                <View style={styles.formCard}>
                    {/* Origin */}
                    <TouchableOpacity style={styles.inputGroup} onPress={() => openStationModal('origin')}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="train-outline" size={24} color="#F31260" />
                        </View>
                        <View style={styles.textInputContainer}>
                            <AppText style={styles.label}>Dari</AppText>
                            <AppText style={origin ? styles.inputText : styles.placeholderText}>
                                {origin ? origin.nama : 'Stasiun Keberangkatan'}
                            </AppText>
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />

                    {/* Destination */}
                    <TouchableOpacity style={styles.inputGroup} onPress={() => openStationModal('destination')}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="train-outline" size={24} color="#F31260" />
                        </View>
                        <View style={styles.textInputContainer}>
                            <AppText style={styles.label}>Ke</AppText>
                            <AppText style={destination ? styles.inputText : styles.placeholderText}>
                                {destination ? destination.nama : 'Stasiun Tujuan'}
                            </AppText>
                        </View>
                    </TouchableOpacity>

                    {/* Swap Button */}
                    <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                        <Ionicons name="swap-vertical" size={24} color="#F31260" />
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    {/* Date */}
                    <TouchableOpacity style={styles.inputGroupBorder} onPress={() => setShowDatePicker(true)}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar-outline" size={24} color="#F31260" />
                        </View>
                        <View style={styles.textInputContainer}>
                            <AppText style={styles.label}>Tanggal Pergi</AppText>
                            <AppText style={styles.inputText}>{formatDate(date)}</AppText>
                        </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    <View style={styles.spacer} />

                    {/* Passengers */}
                    <View style={styles.inputGroupBorder}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="people-outline" size={24} color="#F31260" />
                        </View>
                        <View style={styles.textInputContainer}>
                            <AppText style={styles.label}>Penumpang</AppText>
                            <TextInput
                                style={styles.input}
                                value={passengers}
                                onChangeText={setPassengers}
                                placeholder="Jumlah Penumpang"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.spacerLarge} />

                    {/* Search Button */}
                    <TouchableOpacity 
                        style={[styles.searchButton, (!origin || !destination) && styles.searchButtonDisabled]} 
                        disabled={!origin || !destination}
                        onPress={() => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const localDateString = `${year}-${month}-${day}`;

                            navigation.navigate('TrainList', {
                                origin: origin.nama,
                                destination: destination.nama,
                                originId: origin.id,
                                destinationId: destination.id,
                                date: localDateString,
                                passengers
                            });
                        }}
                    >
                        <AppText style={styles.searchButtonText}>Cari Tiket Kereta</AppText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Station Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>Pilih Stasiun</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#888" style={{marginRight: 10}} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari stasiun..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={true}
                            />
                        </View>

                        <FlatList
                            data={filteredStations}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.stationItem} onPress={() => selectStation(item)}>
                                    <View>
                                        <AppText style={styles.stationName}>{item.nama} ({item.kode})</AppText>
                                        <AppText style={styles.stationCity}>{item.kota}</AppText>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
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
        height: 180,
        paddingTop: 60,
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
        marginTop: -40,
        paddingHorizontal: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    inputGroupBorder: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    iconContainer: {
        marginRight: 15,
    },
    textInputContainer: {
        flex: 1,
    },
    label: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    input: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        padding: 0,
    },
    inputText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    placeholderText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#888',
    },
    divider: {
        height: 1,
        backgroundColor: '#E4E4E7',
        marginLeft: 55,
        marginVertical: 5,
    },
    swapButton: {
        position: 'absolute',
        right: 20,
        top: 65, 
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    spacer: {
        height: 15,
    },
    spacerLarge: {
        height: 30,
    },
    searchButton: {
        backgroundColor: '#F31260',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    searchButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    searchButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
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
        height: '80%',
        padding: 20,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
    },
    stationItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    stationName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    stationCity: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
    },
});
