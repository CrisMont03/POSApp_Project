import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/authContext/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}