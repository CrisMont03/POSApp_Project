import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { db, auth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";

const COLORS = {
    primary: "#a0312e",
    secondary: "#b74b46",
    accent: "#cf665e",
    lightAccent: "#e78076",
    background: "#fff",
    inputBackground: "#fff5f4",
    text: "#333",
};

export default function ClientHomeScreen() {
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);
    const [clientName, setClientName] = useState("");

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
        router.push("/menuCliente/viewOrder/OrderListScreen");
    };

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setClientName(data.name); // o data.nombre si así lo guardaste
                    }
                } catch (error) {
                    console.error("Error al obtener el nombre del cliente:", error);
                }
            }
        };
    
        fetchUserName();
    }, []);
    

    return (
        <View style={styles.container}>
            <Text style={styles.titleMain}>Bienvenido</Text>
            <Text style={styles.name}>
                - {clientName ? `${clientName}` : "Cargando..."} -
            </Text>

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
        backgroundColor: COLORS.inputBackground,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    titleMain: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 4,
        color: COLORS.primary,
        textAlign: "center",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 30,
        color: COLORS.text,
        textAlign: "center",
    },
    button: {
        backgroundColor: COLORS.background,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginVertical: 10,
        width: "80%",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: COLORS.primary,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
    },
    logoutText: {
        color: COLORS.background,
    },
    flash: {
        backgroundColor: COLORS.background,
    },
});
