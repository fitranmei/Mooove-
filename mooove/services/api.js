import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
    switch (Platform.OS) {
        case 'android':
            return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:8080';
        case 'ios':
            return process.env.EXPO_PUBLIC_API_URL_IOS || 'http://localhost:8080';
        case 'web':
            return process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:8080';
        default:
            return process.env.EXPO_PUBLIC_API_URL_LOCAL || 'http://localhost:8080';
    }
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (request) => {
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
        return [];
    }
};

export const getAllSchedules = async () => {
    try {
        const response = await api.get('/jadwal');
        return Array.isArray(response.data) ? response.data : response.data.data;
    } catch (error) {
        return [];
    }
};

export const getTrains = async () => {
    try {
        const response = await api.get('/kereta');
        return Array.isArray(response.data) ? response.data : response.data.data;
    } catch (error) {
        return [];
    }
};

export const getScheduleSeats = async (scheduleId) => {
    try {
        const response = await api.get(`/jadwal/${scheduleId}/kursi`);
        return response.data; 
    } catch (error) {
        return null;
    }
};

export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const payBooking = async (bookingId) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/pay`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateBookingStatus = async (bookingId) => {
    try {
        const response = await api.put(`/bookings/${bookingId}/pay-success`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const getUserBookings = async () => {
    try {
        const response = await api.get('/user/bookings');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const getBookingDetails = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export default api;
