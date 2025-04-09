import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Alert,
} from "react-native";
import { collection, getDocs, query, orderBy, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StatusStepper from "@/app/menuChef/viewOrders/StatusStepper"; // o la ruta relativa correcta


const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    cardBackground: "#fff",
};

const STATUS_STEPS = [
    "Pedido",
    "Cocinando",
    "Listo para recoger",
    "Entregado",
    "Listo para pagar",
];

export default function OrdersReceivedScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const q = query(collection(db, "cart"), orderBy("timestamp", "asc"));
            const querySnapshot = await getDocs(q);
            const data: any[] = [];
    
            for (const docSnap of querySnapshot.docs) {
                const orderData = docSnap.data();
                const userId = orderData.userId;
    
                let customerName = "Desconocido";
    
                if (userId) {
                    try {
                        const userRef = doc(db, "users", userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            customerName = userSnap.data()?.name || "Sin nombre";
                        }
                    } catch (userError) {
                        console.warn(`No se pudo obtener el usuario con ID ${userId}:`, userError);
                    }
                }
    
                data.push({
                    id: docSnap.id,
                    ...orderData,
                    customerName, // Agregamos el nombre del cliente
                });
            }
    
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const ref = doc(db, "cart", orderId);
            await updateDoc(ref, {
                status: newStatus,
                [`statusHistory.${newStatus}`]: {
                timestamp: serverTimestamp(),
                },
            });
        
            setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert("Error", "No se pudo actualizar el estado del pedido.");
        }
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

        <View style={styles.titleContainer}>
            <Ionicons name="receipt-outline" size={24} color={COLORS.cardBackground} />
            <Text style={styles.title}>Pedidos Recibidos</Text>
        </View>

        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item, index }) => {
            const isFinalStep = item.status === "Listo para pagar";
            return (
                <View style={styles.orderCard}>
                    <View style={styles.row}>
                        <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.orderTitle}>Pedido {index + 1}</Text>
                    </View>
                    <Text style={styles.customerName}>
                        Cliente: {item.customerName}
                    </Text>

                    <StatusStepper
                        currentStatus={item.status}
                        onStepChange={(newStatus) => updateOrderStatus(item.id, newStatus)}
                        steps={STATUS_STEPS}
                        colors={COLORS}
                    />
                    <Text style={styles.timestamp}>
                    {new Date(item.timestamp?.toDate?.()).toLocaleString()}
                    </Text>

                    {!isFinalStep && (
                        <Pressable
                        style={styles.nextButton}
                        onPress={() =>
                        router.push({
                            pathname: "/menuChef/viewOrders/ViewOrderReceivedScreen",
                            params: { order: JSON.stringify(item) },
                        })
                        }
                        >
                        <Ionicons name="chevron-forward-circle-outline" size={26} color={COLORS.primary} />
                        <Text style={styles.nextText}>Ver productos del pedido</Text>
                        </Pressable>
                    )}
                </View>
            );
            }}
        />
        </View>
    );
}

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
    titleContainer: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.cardBackground,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    orderCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.darkText,
        marginLeft: 8,
    },
    status: {
        fontSize: 15,
        color: "#444",
        marginTop: 4,
    },
    timestamp: {
        fontSize: 13,
        color: "#777",
        marginTop: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    nextButton: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    nextText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "600",
    },
    customerName: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
        marginLeft: 2, // para alinear con el título
    },
});
