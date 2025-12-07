import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

const { width } = Dimensions.get('window');

export default function CustomAlert({ 
    visible, 
    title, 
    onCancel, 
    onConfirm, 
    cancelText = "Batal", 
    confirmText = "Lanjutkan", 
    icon = "warning",
    note
}) {
    const formatNote = (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <AppText style={styles.title}>{title}</AppText>
                    
                    {note && (
                        <AppText style={styles.note}>{formatNote(note)}</AppText>
                    )}

                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={60} color="#F31260" />
                    </View>

                    <View style={styles.buttonContainer}>
                        {onCancel && (
                            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                <AppText style={styles.cancelButtonText}>{cancelText}</AppText>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            style={[styles.confirmButton, !onCancel && { flex: 1 }]} 
                            onPress={onConfirm}
                        >
                            <AppText style={styles.confirmButtonText}>{confirmText}</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 26,
    },
    iconContainer: {
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F31260',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#F31260',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F31260',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    note: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    }
});