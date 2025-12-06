import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { getSchedules } from '../services/api';

export default function TrainList({ navigation, route }) {
    const { origin, destination, date, passengers, originId, destinationId } = route.params || {
        origin: 'KERTAPATI',
        destination: 'LUBUK LINGGAU',
        date: new Date().toISOString(),
        passengers: '1'
    };

    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Gunakan ID jika ada, jika tidak gunakan nama (fallback)
            const o = originId || origin;
            const d = destinationId || destination;
            
            const data = await getSchedules(o, d, date);
            
            if (data && Array.isArray(data)) {
                // Mapping data backend ke format UI
                const mapped = data.map(item => ({
                    id: item.id,
                    name: item.train?.name || item.train_name || 'Kereta',
                    duration: item.duration || '-', 
                    departureTime: item.departure_time?.substring(0, 5) || item.departureTime,
                    departureStation: `${origin}`,
                    arrivalTime: item.arrival_time?.substring(0, 5) || item.arrivalTime,
                    arrivalStation: `${destination}`,
                    classes: item.classes || [] // Pastikan backend mengirim array classes
                }));
                setTrains(mapped);
            } else {
                setTrains([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [origin, destination, date]);

    const toggleExpand = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    const formatCurrency = (amount) => {
        return `Rp${amount.toLocaleString('id-ID')}`;
    };

    const renderTrainCard = ({ item }) => {
        const isExpanded = expandedCard === item.id;

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
                    <View style={styles.cardHeader}>
                        <AppText style={styles.trainName}>{item.name}</AppText>
                        <AppText style={styles.duration}>{item.duration}</AppText>
                    </View>

                    <View style={styles.routeContainer}>
                        <View style={styles.timeStation}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineLine} />
                            <AppText style={styles.time}>{item.departureTime}</AppText>
                            <AppText style={styles.station}>{item.departureStation}</AppText>
                        </View>
                        <View style={styles.timeStation}>
                            <View style={[styles.timelineDot, { backgroundColor: '#F31260' }]} />
                            <AppText style={styles.time}>{item.arrivalTime}</AppText>
                            <AppText style={styles.station}>{item.arrivalStation}</AppText>
                        </View>
                    </View>

                    {!isExpanded && (
                        <View style={styles.expandHint}>
                            <AppText style={styles.expandText}>Lihat Kelas</AppText>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </View>
                    )}
                     {isExpanded && (
                        <View style={styles.expandHint}>
                            <AppText style={styles.expandText}>Tutup</AppText>
                            <Ionicons name="chevron-up" size={16} color="#888" />
                        </View>
                    )}
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.classList}>
                        {item.classes.map((cls, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.classItem} 
                                onPress={() => navigation.navigate('PassengerData', {
                                    train: item,
                                    selectedClass: cls,
                                    origin,
                                    destination,
                                    date,
                                    passengers
                                })}
                            >
                                <View>
                                    <AppText style={styles.classType}>{cls.type}</AppText>
                                    <AppText style={styles.passengers}>{passengers}</AppText>
                                </View>
                                <AppText style={styles.price}>{formatCurrency(cls.price)}</AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <AppText style={styles.routeText}>{origin} (KPT) {'>'} {destination} (LLG)</AppText>
                        <AppText style={styles.dateText}>{formattedDate} • {passengers}</AppText>
                    </View>
                </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
                <AppText style={styles.pageTitle}>Pilih Kereta Berangkat</AppText>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#F31260" style={{marginTop: 50}} />
                ) : (
                    <FlatList
                        data={trains}
                        keyExtractor={item => item.id}
                        renderItem={renderTrainCard}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View style={{alignItems: 'center', marginTop: 50}}>
                                <AppText style={{color: '#888'}}>Tidak ada jadwal kereta tersedia.</AppText>
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
        height: 150,
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
    routeText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    dateText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#E0E0E0',
        marginTop: 2,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    pageTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
    duration: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
    },
    routeContainer: {
        marginBottom: 15,
    },
    timeStation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative',
        paddingLeft: 20,
    },
    timelineDot: {
        position: 'absolute',
        left: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#F31260',
        zIndex: 1,
    },
    timelineLine: {
        position: 'absolute',
        left: 3,
        top: 8,
        bottom: -20,
        width: 2,
        backgroundColor: '#F31260',
    },
    time: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        width: 60,
    },
    station: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666',
    },
    expandHint: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5,
    },
    expandText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#888',
        marginRight: 5,
    },
    classList: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
    },
    classItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    classType: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 2,
    },
    passengers: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#000',
    },
    price: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    },
});