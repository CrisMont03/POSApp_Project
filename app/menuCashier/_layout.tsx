import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/authContext/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="index" options={{ title: "Menu del Administrador" }} />
            <Stack.Screen name="CRUDProducto/ProductListScreen" options={{ title: "Lista de productos" }} />
            <Stack.Screen name="CRUDProducto/CreateProductScreen" options={{ title: "Agregar producto" }} />
            <Stack.Screen name="CRUDProducto/EditProductScreen" options={{ title: "Actualizar producto" }} />
            </Stack>
        </AuthProvider>
    );
}