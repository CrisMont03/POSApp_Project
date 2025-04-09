import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { auth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

const COLORS = {
    primary: "#a0312e",
    secondary: "#b74b46",
    accent: "#cf665e",
    lightAccent: "#e78076",
    background: "#fff",
    inputBackground: "#fff5f4",
    text: "#fff",
};

export default function ClientHomeScreen() {
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);

    const flash = () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500);
    };

    const handleLogout = async () => {
        flash();
        await signOut(auth);
        router.replace("/auth/Authentication");
    };

    const goToMenu = () => {
        flash();
        router.push("/menuCliente/viewMenu/ViewMenuScreen");
    };

    const goToCart = () => {
        flash();
        router.push("/menuCliente/viewOrder/ViewOrderScreen");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido</Text>

            <Pressable style={[styles.button, isFlashing && styles.flash]} onPress={goToMenu}>
                <Text style={styles.buttonText}>📖 Ver menú</Text>
            </Pressable>

            <Pressable style={[styles.button, isFlashing && styles.flash]} onPress={goToCart}>
                <Text style={styles.buttonText}>🛒 Ver pedidos</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={[styles.buttonText, styles.logoutText]}>🔒 Cerrar sesión</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 30,
        color: COLORS.primary,
        textAlign: "center",
    },
    button: {
        backgroundColor: COLORS.lightAccent,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginVertical: 10,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: COLORS.primary,
    },
    logoutText: {
        color: COLORS.background,
    },
    flash: {
        backgroundColor: COLORS.lightAccent,
    },
});
