import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (fullname, email, password) => {
    try {
        const response = await api.post('/auth/register', {
            fullname,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        
        if (response.data.token) {
            await AsyncStorage.setItem('userToken', response.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
};

export const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
};

export const getUserData = async () => {
    const jsonValue = await AsyncStorage.getItem('userData');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
};
