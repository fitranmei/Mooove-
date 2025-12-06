import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.OS === 'android' 
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID 
    : process.env.EXPO_PUBLIC_API_URL_LOCAL;

const api = axios.create({
    baseURL: BASE_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (request) => {
    console.log('Starting Request:', request.method.toUpperCase(), request.baseURL + request.url);
    
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
});

export const getStations = async () => {
    try {
        const response = await api.get('/stasiun');
        return Array.isArray(response.data) ? response.data : response.data.data; 
    } catch (error) {
        console.error("Error fetching stations:", error);
        return [];
    }
};

export const getSchedules = async (origin, destination, date) => {
    try {
        const dateObj = new Date(date);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        // Use /jadwal/cari for filtering
        const response = await api.get('/jadwal/cari', {
            params: {
                asal: origin,        // Backend expects 'asal'
                tujuan: destination, // Backend expects 'tujuan'
                tanggal: dateStr     // Backend expects 'tanggal'
            }
        });
        // Handle if response is directly the array or wrapped in data
        return Array.isArray(response.data) ? response.data : response.data.data;
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return [];
    }
};

export const getScheduleSeats = async (scheduleId) => {
    try {
        const response = await api.get(`/jadwal/${scheduleId}/kursi`);
        return response.data; // Returns the full object structure directly
    } catch (error) {
        console.error("Error fetching schedule seats:", error);
        return null;
    }
};

export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        if (error.response) {
            console.error("Error Response Data:", JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
};

export const payBooking = async (bookingId) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/pay`);
        return response.data;
    } catch (error) {
        console.error("Error initiating payment:", error);
        if (error.response) {
            console.error("Error Response Data:", JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
};

export const updateBookingStatus = async (bookingId) => {
    try {
        const response = await api.put(`/bookings/${bookingId}/pay-success`);
        return response.data;
    } catch (error) {
        console.error("Error updating booking status:", error);
        return null;
    }
};

export const getUserBookings = async () => {
    try {
        const response = await api.get('/user/bookings');
        return response.data;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return null;
    }
};

export default api;
