import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/authContext/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="menuCliente/index" options={{ title: "Menu del Cliente" }} />
            <Stack.Screen name="menuChef/index" options={{ title: "Menu del Cashier" }} />
            <Stack.Screen name="menuCachier/index" options={{ title: "Menu del Chef" }} />
            </Stack>
        </AuthProvider>
    );
}