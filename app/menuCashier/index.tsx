import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { db, auth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";

export default function HomeScreen() {
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);
    const [cashierName, setCashierName] = useState("");

    const handleLogout = async () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500); // Parpadea
        console.log("Botón presionado");

        await signOut(auth);
        router.replace("/auth/Authentication"); // Redirige al login
    };

    const goToProducts = () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500); // Parpadea
        console.log("Botón presionado");

        router.push("/menuCashier/CRUDProducts/ProductListScreen");
    };

    const goToOrders = () => {
        console.log("Botón presionado");
        router.push("/menuCashier/viewOrders/ViewAllOrdersScreen");
    };

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setCashierName(data.name); // o data.nombre si así lo guardaste
                    }
                } catch (error) {
                    console.error("Error al obtener el nombre del cashier:", error);
                }
            }
        };
    
        fetchUserName();
    }, []);

    return (
        <View style={styles.container}>
        <Text style={styles.titleMain}>Bienvenido, Admin</Text>
        <Text style={styles.name}>
            - {cashierName ? `${cashierName}` : "Cargando..."} -
        </Text>

        <Pressable style={[styles.button, isFlashing && styles.flash]}  onPress={goToProducts}>
            <Text style={styles.buttonText}>📋 Administrar productos</Text>
        </Pressable>

        <Pressable style={[styles.button, isFlashing && styles.flash]}  onPress={goToOrders}>
            <Text style={styles.buttonText}>✉️ Ver pedidos</Text>
        </Pressable>

        <Pressable 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutText]}>🔒 Cerrar sesión</Text>
        </Pressable>
        </View>
    );
}

const COLORS = {
    primary: "#a0312e",
    secondary: "#b74b46",
    accent: "#cf665e",
    lightAccent: "#e78076",
    background: "#fff",
    inputBackground: "#fff5f4",
    text: "#333",
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff5f4",
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
        borderWidth: 0,
        borderColor: COLORS.secondary,
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
        color: "#fff",
    },
    flash: {
        backgroundColor: "#ff9b8e", // Color que parpadea
    },
});
