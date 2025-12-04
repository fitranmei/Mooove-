import React from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function PaymentMethod({ navigation, route }) {
    const methods = [
        { category: 'Bayar dengan ATM/Mobile/Internet Banking', items: [
            { id: 'bca', name: 'BANK BCA', icon: 'card-outline' },
            { id: 'bri', name: 'BANK BRI', icon: 'card-outline' },
            { id: 'mandiri', name: 'BANK MANDIRI', icon: 'card-outline' },
            { id: 'other', name: 'BANK LAINNYA', icon: 'business-outline' },
        ]},
        { category: 'Bayar dengan E-Wallet', items: [
            { id: 'gopay', name: 'GOPAY', icon: 'wallet-outline' },
            { id: 'ovo', name: 'OVO', icon: 'wallet-outline' },
            { id: 'dana', name: 'DANA', icon: 'wallet-outline' },
        ]}
    ];

    const handleSelect = (method) => {
        navigation.navigate('PaymentConfirmation', { 
            ...route.params,
            selectedPaymentMethod: method 
        });
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
                {methods.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <AppText style={styles.sectionHeader}>{section.category}</AppText>
                        {section.items.map((item, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.methodItem}
                                onPress={() => handleSelect(item)}
                            >
                                <View style={styles.methodInfo}>
                                    <Ionicons name={item.icon} size={24} color="#0056b3" style={{ marginRight: 15 }} /> 
                                    <AppText style={styles.methodName}>{item.name}</AppText>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
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
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
        marginBottom: 15,
    },
    methodItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#000',
    }
});