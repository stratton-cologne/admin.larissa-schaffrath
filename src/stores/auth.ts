// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/lib/axios";
import type { User } from "@/types";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(localStorage.getItem("token"));

    const isAuthenticated = computed(() => !!token.value);

    const setToken = (newToken: string) => {
        token.value = newToken;
        localStorage.setItem("token", newToken);
    };

    const clearToken = () => {
        token.value = null;
        localStorage.removeItem("token");
    };

    const login = async (email: string, password: string) => {
        const response = await axios.post("/api/auth/login", {
            email,
            password,
        });
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        user.value = userData;
        return userData;
    };

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearToken();
            user.value = null;
        }
    };

    const fetchUser = async () => {
        if (!token.value) return null;
        const response = await axios.get("/api/me");
        user.value = response.data;
        return user.value;
    };

    const updatePassword = async (
        currentPassword: string,
        newPassword: string,
    ) => {
        await axios.put("/api/me/password", {
            current_password: currentPassword,
            new_password: newPassword,
        });
    };

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        fetchUser,
        updatePassword,
    };
});
