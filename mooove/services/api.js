import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' 
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID 
    : process.env.EXPO_PUBLIC_API_URL_LOCAL;

const api = axios.create({
    baseURL: BASE_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log requests for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request.method.toUpperCase(), request.baseURL + request.url);
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
        
        const response = await api.get('/jadwal', {
            params: {
                origin,
                destination,
                date: dateStr
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

export default api;
