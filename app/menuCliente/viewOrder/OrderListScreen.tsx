import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, TouchableOpacity } from "react-native";
import { collection, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const STATUS_STEPS = [
    "Pedido",
    "Cocinando",
    "Listo para recoger",
    "Entregado",
    "Listo para pagar",
];

    const STATUS_ICONS: Record<string, any> = {
    "Pedido": "receipt-outline",
    "Cocinando": "restaurant-outline",
    "Listo para recoger": "walk-outline",
    "Entregado": "checkmark-done-outline",
    "Listo para pagar": "card-outline",
};

export default function OrderListScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
    
        const q = query(
            collection(db, "cart"),
            where("userId", "==", user.uid),
            orderBy("timestamp", "asc")
        );
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const updatedOrders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(updatedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error in real-time listener: ", error);
            setLoading(false);
        });
    
        return () => unsubscribe(); // se limpia al desmontar
    }, []);    

    const getStatusStep = (status: string) => STATUS_STEPS.indexOf(status);

    const renderProgressBar = (status: string, statusHistory: any) => {
        const currentStep = getStatusStep(status);
        return (
            <View style={styles.progressContainer}>
                {STATUS_STEPS.map((step, index) => {
                    const timestamp = statusHistory?.[step]?.timestamp?.toDate?.();
                    const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    
                    return (
                        <View key={step} style={styles.stepContainer}>
                            <Ionicons
                                name={STATUS_ICONS[step]}
                                size={18}
                                color={index <= currentStep ? COLORS.primary : "#ccc"}
                                style={styles.icon}
                            />
                            <View>
                                <Text style={[
                                    styles.stepLabel,
                                    { color: index <= currentStep ? COLORS.primary : "#aaa" }
                                ]}>
                                    {step}
                                </Text>
                                {formattedTime && (
                                    <Text style={styles.stepTime}>
                                        {formattedTime}
                                    </Text>
                                )}
                            </View>
                            {index < STATUS_STEPS.length - 1 && (
                                <View
                                    style={[
                                        styles.line,
                                        { backgroundColor: index < currentStep ? COLORS.primary : "#ccc" },
                                    ]}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };
    

    if (loading) {
        return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#a0312e" />
            <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <View style={styles.header}>
            <Ionicons name="list-circle-outline" size={30} color={COLORS.primary} style={styles.headerIcon} />
            <Text style={styles.title}>Mis Pedidos</Text>
        </View>
        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: "/menuCliente/viewOrder/ViewOrderScreen",
                        params: { order: JSON.stringify(item) }, // pasamos el pedido como string
                    })}
                >
                    <View style={styles.orderCard}>
                        <Text style={styles.orderTitle}>Pedido #{index + 1}</Text>
                        <View style={styles.statusRow}>
                        <Ionicons
                            name={STATUS_ICONS[item.status] || "help-outline"}
                            size={18}
                            color={COLORS.primary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.orderSubtitle}>Estado actual: {item.status}</Text>
                        </View>
                        <Text style={styles.timestamp}>
                        Fecha: {new Date(item.timestamp?.toDate?.()).toLocaleString()}
                        </Text>
                        {renderProgressBar(item.status, item.statusHistory)}
                    </View>
                </TouchableOpacity>
            )}
        />
        </View>
    );
}

const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    cardBackground: "#fff",
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backText: {
        marginLeft: 6,
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "500",
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        borderRadius: 10
    },
    headerIcon: {
        marginRight: 10,
        color: COLORS.background,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    orderCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 5,
    },
    orderSubtitle: {
        fontSize: 15,
        color: COLORS.darkText,
    },
    timestamp: {
        fontSize: 13,
        color: "#777",
        marginTop: 6,
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    stepLabel: {
        fontSize: 10,
        marginRight: 6,
    },
    line: {
        height: 2,
        width: 16,
    },
    stepTime: {
        fontSize: 9,
        color: "#999",
        marginTop: 2,
    },    
});
