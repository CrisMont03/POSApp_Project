import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TouchableOpacity, Alert } from "react-native";
import { collection, onSnapshot, orderBy, query, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const STATUS_STEPS = [
    "Pedido",
    "Cocinando",
    "Listo para recoger",
    "Entregado",
    "Listo para pagar",
    "Pagado",
];

const STATUS_ICONS: Record<string, any> = {
    "Pedido": "receipt-outline",
    "Cocinando": "restaurant-outline",
    "Listo para recoger": "walk-outline",
    "Entregado": "checkmark-done-outline",
    "Listo para pagar": "card-outline",
    "Pagado": "checkmark-circle-outline",
};

const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    cardBackground: "#fff",
};

export default function ViewAllOrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [sortByNewest, setSortByNewest] = useState(true);

    const router = useRouter();


    useEffect(() => {
        const q = query(collection(db, "cart"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setOrders(updatedOrders);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusStep = (status: string) => STATUS_STEPS.indexOf(status);

    const moveToHistory = async (orderId: string) => {
        const orderRef = doc(db, "cart", orderId);
        const orderSnap = await getDoc(orderRef);
    
        if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            const historyRef = doc(db, "ordersHistory", orderId);
    
            // Agregar el pedido a la colección de historial
            await setDoc(historyRef, orderData);
    
            // Eliminar el pedido de la colección original
            await deleteDoc(orderRef);
        }
    };

    const goToHistory = () => {
        console.log("Botón presionado");
        router.push("/menuCashier/viewOrders/ViewHistory");
    };

    const calculateTotal = (productos: any[]) => {
        if (!productos || !Array.isArray(productos)) return 0;
        const subtotal = productos.reduce((acc, prod) => {
            const precio = parseFloat(prod.price || 0);
            const cantidad = parseInt(prod.quantity || 1);
            return acc + (precio * cantidad);
        }, 0);
        const totalConImpuestos = subtotal * 1.16; // Sumamos el 16% de IVA
        return totalConImpuestos;
    };
    

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
            <Ionicons name="list-circle-outline" size={30} color={COLORS.background} style={styles.headerIcon} />
            <Text style={styles.title}>Todos los pedidos</Text>

            <TouchableOpacity style={styles.historyIconContainer} onPress={goToHistory}>
                <Ionicons name="time-outline" size={24} color={COLORS.background} />
                <Text style={styles.history}>Historial</Text>
            </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <TouchableOpacity
                onPress={() => {
                    // Ciclamos por los estados
                    const currentIndex = STATUS_STEPS.indexOf(selectedStatus ?? "");
                    const nextIndex = (currentIndex + 1) % (STATUS_STEPS.length + 1);
                    setSelectedStatus(nextIndex === STATUS_STEPS.length ? null : STATUS_STEPS[nextIndex]);
                }}
                style={{ backgroundColor: "#eee", padding: 10, borderRadius: 10 }}
            >
                <Text>Estado: {selectedStatus || "Todos"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setSortByNewest(!sortByNewest)}
                style={{ backgroundColor: "#eee", padding: 10, borderRadius: 10 }}
            >
                <Text>Fecha: {sortByNewest ? "Más reciente" : "Más antiguo"}</Text>
            </TouchableOpacity>
        </View>

        <FlatList
            data={orders.filter(order => 
                !selectedStatus || order.status === selectedStatus)
                .sort((a, b) => {
                    const dateA = a.timestamp?.toDate?.();
                    const dateB = b.timestamp?.toDate?.();
                    if (!dateA || !dateB) return 0;
                    return sortByNewest
                        ? dateB.getTime() - dateA.getTime()
                        : dateA.getTime() - dateB.getTime();
                })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item, index }) => (
                <View style={styles.orderCard}>
                {/* TODO: Evitar que toda la card capture el toque */}
                <Pressable
                    onPress={() => router.push({
                    pathname: "/menuCashier/viewOrders/ViewOrderScreenAdmin",
                    params: { order: JSON.stringify(item) },
                    })}
                >
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
                    <Text style={styles.tableId}>Mesa: {item.mesaId || "No asignada"}</Text>
                    <Text style={styles.totalText}>Total: ${calculateTotal(item.items).toFixed(2)}</Text>
                    <Text style={styles.timestamp}>Fecha: {new Date(item.timestamp?.toDate?.()).toLocaleString()}</Text>
                    {renderProgressBar(item.status, item.statusHistory)}
                </Pressable>

                {/* Este botón debe estar FUERA del Pressable anterior */}
                {item.status === "Pagado" && (
                    <Pressable
                    style={styles.historyButton}
                    onPress={() => {
                        console.log("Click en pasar a historial"); // Para verificar
                        Alert.alert("Pedido enviado al historial");
                        moveToHistory(item.id);
                        console.log("Click despues de historial");
                    }}
                    >
                    <Text style={styles.historyButtonText}>Pasar a historial</Text>
                    </Pressable>
                )}
                </View>
            )}
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
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        borderRadius: 10,
    },
    headerIcon: {
        marginRight: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLORS.background,
    },
    history: {
        fontSize: 12,
        fontWeight: "bold",
        color: COLORS.background,
    },
    historyIconContainer: {
        position: "absolute",
        right: 16,
        top: 12,
        padding: 6,
        borderRadius: 20,
        alignItems: "center",
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
    tableId: {
        fontSize: 14,
        color: "#444",
        marginTop: 4,
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
    historyButton: {
        padding: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
        zIndex: 2, // <- Esto ayuda
    },
    historyButtonText: {
        color: COLORS.cardBackground,
        fontSize: 16,
        fontWeight: "bold",
    },
    totalText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#000",
        marginTop: 6,
    },
});
