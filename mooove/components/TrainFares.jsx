import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { getAllSchedules, getTrains } from '../services/api';

export default function TrainFares({ navigation }) {
    const [fares, setFares] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFares = async () => {
            try {
                const [schedulesData, trainsData] = await Promise.all([
                    getAllSchedules(),
                    getTrains()
                ]);
                
                const trainsMap = {};
                if (Array.isArray(trainsData)) {
                    trainsData.forEach(train => {
                        trainsMap[train.id] = train.nama;
                    });
                }

                const processedFares = {};
                
                schedulesData.forEach(schedule => {
                    const trainName = schedule.kereta?.nama || trainsMap[schedule.kereta_id];
                    
                    if (!trainName) return;

                    if (!processedFares[trainName]) {
                        processedFares[trainName] = {
                            id: schedule.id,
                            train: trainName,
                            classes: []
                        };
                    }

                    const className = schedule.kelas ? schedule.kelas.charAt(0).toUpperCase() + schedule.kelas.slice(1) : 'Ekonomi'; 
                    const price = schedule.harga_dasar || schedule.harga;
                    
                    const existingClass = processedFares[trainName].classes.find(c => c.name === className);
                    
                    if (!existingClass) {
                        if (price !== null && price !== undefined) {
                            processedFares[trainName].classes.push({
                                name: className,
                                price: `Rp ${Number(price).toLocaleString('id-ID')}`
                            });
                        }
                    }
                });

                setFares(Object.values(processedFares));
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchFares();
    }, []);

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
                    <AppText style={styles.title}>Tarif Kereta</AppText>
                </View>
            </ImageBackground>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <AppText style={styles.sectionTitle}>Daftar Tarif Kereta</AppText>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#F31260" style={{ marginTop: 50 }} />
                ) : fares.length === 0 ? (
                    <AppText style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>Tidak ada data tarif tersedia</AppText>
                ) : (
                    fares.map((item, index) => (
                        <View key={item.id || index} style={styles.card}>
                            <AppText style={styles.trainName}>{item.train}</AppText>
                            <View style={styles.divider} />
                            {item.classes.length > 0 ? (
                                item.classes.map((cls, idx) => (
                                    <View key={idx} style={styles.classRow}>
                                        <AppText style={styles.className}>{cls.name}</AppText>
                                        <AppText style={styles.price}>{cls.price}</AppText>
                                    </View>
                                ))
                            ) : (
                                <AppText style={{ color: '#888', fontStyle: 'italic' }}>Harga tidak tersedia</AppText>
                            )}
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
    trainName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#F31260',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 10,
    },
    classRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    className: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
        color: '#333',
    },
    price: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#333',
    }
});
