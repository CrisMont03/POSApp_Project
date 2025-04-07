import React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "@/utils/FirebaseConfig"
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/auth/Authentication"); // Volver a la pantalla de login
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Bienvenido Cliente</Text>
        <Button title="Cerrar Sesión" onPress={handleLogout} color="red" />
        </View>
    );
}
