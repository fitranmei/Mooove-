import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from './AppText';
import { getAllSchedules, getStations } from '../services/api';

export default function TrainSchedule({ navigation }) {
    const [schedules, setSchedules] = useState([]);
    const [stations, setStations] = useState({});
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schedulesData, stationsData] = await Promise.all([
                    getAllSchedules(),
                    getStations()
                ]);
                
                const stationsMap = {};
                if (Array.isArray(stationsData)) {
                    stationsData.forEach(station => {
                        stationsMap[station.id] = station.nama;
                    });
                }
                setStations(stationsMap);
                setSchedules(schedulesData);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const filteredSchedules = schedules.filter(item => {
        const dateSource = item.waktu_berangkat || item.waktuBerangkat || item.tanggal;
        if (!dateSource) return false;

        let itemDateStr = '';
        if (dateSource.includes('T')) {
             itemDateStr = dateSource.split('T')[0];
        } else {
             itemDateStr = dateSource.split(' ')[0];
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const selectedDateStr = `${year}-${month}-${day}`;

        return itemDateStr === selectedDateStr;
    });

    const getStationName = (id, stationObj) => {
        if (stationObj && stationObj.nama) return stationObj.nama;
        if (id && stations[id]) return stations[id];
        return 'Stasiun';
    };

    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        try {
            if (dateString.includes(' ')) {
                return dateString.split(' ')[1].substring(0, 5);
            }
            if (dateString.includes('T')) {
                const date = new Date(dateString);
                return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            if (dateString.includes(':')) {
                return dateString.substring(0, 5);
            }
            return '--:--';
        } catch (e) {
            return '--:--';
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.headerBg}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <AppText style={styles.title}>Jadwal Kereta</AppText>
                </View>
            </ImageBackground>
            
            <View style={styles.dateFilterContainer}>
                <AppText style={styles.dateLabel}>Pilih Tanggal:</AppText>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Ionicons name="calendar-outline" size={20} color="#F31260" />
                    <AppText style={styles.dateText}>
                        {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </AppText>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeDate}
                />
            )}
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <AppText style={styles.sectionTitle}>Jadwal Keberangkatan</AppText>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#F31260" style={{ marginTop: 50 }} />
                ) : filteredSchedules.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Ionicons name="train-outline" size={50} color="#DDD" />
                        <AppText style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>
                            Tidak ada jadwal tersedia untuk tanggal ini
                        </AppText>
                    </View>
                ) : (
                    filteredSchedules.map((item, index) => (
                        <View key={item.id || index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <AppText style={styles.trainName}>{item.kereta?.nama || 'Kereta'}</AppText>
                            </View>
                            <AppText style={styles.route}>
                                {getStationName(item.asal_id, item.stasiunAsal)} - {getStationName(item.tujuan_id, item.stasiunTujuan)}
                            </AppText>
                            <View style={styles.timeContainer}>
                                <View style={styles.timeBox}>
                                    <AppText style={styles.timeLabel}>Berangkat</AppText>
                                    <AppText style={styles.timeValue}>
                                        {formatTime(item.waktu_berangkat || item.waktuBerangkat || item.jamBerangkat)}
                                    </AppText>
                                </View>
                                <Ionicons name="arrow-forward" size={20} color="#F31260" />
                                <View style={styles.timeBox}>
                                    <AppText style={styles.timeLabel}>Tiba</AppText>
                                    <AppText style={styles.timeValue}>
                                        {formatTime(item.waktu_tiba || item.waktuTiba || item.jamTiba)}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    headerBg: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        paddingTop: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
    },
    dateFilterContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E7',
    },
    dateLabel: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#333',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F8',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F31260',
    },
    dateText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#F31260',
        marginLeft: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        marginBottom: 15,
        color: '#333',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E4E4E7',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#F31260',
    },
    route: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF5F8',
        padding: 10,
        borderRadius: 10,
    },
    timeBox: {
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    timeValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#333',
    }
});
