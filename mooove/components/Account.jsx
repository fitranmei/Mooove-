import React from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

export default function Account({ navigation }) {
    const menuItems = [
        { id: 1, title: 'Pusat Bantuan', icon: 'help', target: null },
        { id: 2, title: 'Bahasa', icon: 'language', target: null },
        { id: 3, title: 'Log Out', icon: 'log-out-outline', target: 'login' },
    ];

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/bg-top.png')}
                style={styles.headerBg}
                imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            >
                <View style={styles.headerContent}>
                    <AppText style={styles.pageTitle}>Akun Saya</AppText>
                </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
                <View style={styles.userCard}>
                    <View style={styles.profileImageContainer}>
                         <Ionicons name="person" size={40} color="#CCC" />
                    </View>
                    <View style={styles.userInfo}>
                        <AppText style={styles.userName}>USER</AppText>
                        <AppText style={styles.userEmail}>user@user.com</AppText>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem}
                            onPress={() => {
                                if (item.target) {
                                    navigation.navigate(item.target);
                                }
                            }}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                                </View>
                                <AppText style={styles.menuTitle}>{item.title}</AppText>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#000" />
                        </TouchableOpacity>
                    ))}
                </View>
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
        paddingHorizontal: 20,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000',
        marginBottom: 4,
    },
    userEmail: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#A4A3A3',
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F31260',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#000',
    },
});
