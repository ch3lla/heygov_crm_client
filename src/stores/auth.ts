import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/index';
import router from '@/router';
import type { IUser } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') ?? null);
    const user = ref<IUser | null>(null);
    const isProfileOpen = ref(false);

    const getInitials = () => {
        if (!user.value) return '??';
        const firstName = user.value.firstName || '';
        const lastName = user.value.lastName || '';
        return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    };

    const getFullName = () => {
        if (!user.value) return 'Unknown User';
        return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
    };

    const toggleProfile = () => {
        isProfileOpen.value = !isProfileOpen.value;
    };

    const closeProfile = () => {
        isProfileOpen.value = false;
    };

    const updateUserProfile = async (updates: any) => {
        try {
            await apiClient.patch('/user/profile', updates);
            user.value = { ...user.value, ...updates };
            return true;
        } catch (error) {
            console.error("Failed to update profile", error);
            return false;
        }
    };

    const register = async (userData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        password: string;
        confirmPassword: string;
    }) => {
        try {
            const { data } = await apiClient.post('/auth/register', userData);
            if (data.status === "Success" && data.data) {
                token.value = data.data;
                localStorage.setItem('token', data.data);
                await fetchUserProfile();
                router.push('/');
                return { success: true, error: null };
            }
            return { success: false, error: 'Registration failed' };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const login = async (credentials: { email: string; password: string }) => {
        try {
            const { data } = await apiClient.post('/auth/login', credentials);
            if (data.status === "Success" && data.data) {
                token.value = data.data;
                localStorage.setItem('token', data.data);
                await fetchUserProfile();
                router.push('/');
                return { success: true, error: null };
            }
            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        sessionStorage.removeItem('assistant-chat');
        closeProfile();
        router.push('/login');
    };

    const fetchUserProfile = async () => {
        try {
            const { data } = await apiClient.get('/user/profile');
            user.value = data.data; 
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            logout(); 
        }
    };

  return { 
    token, 
    user, 
    isProfileOpen,
    register,
    login, 
    logout,
    fetchUserProfile,
    getInitials,
    getFullName,
    toggleProfile,
    closeProfile,
    updateUserProfile
  };
}, 
{
    persist: {
      key: 'auth',
      storage: localStorage
    }
});