import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BadgeCheck, Clock, CalendarDays, ShoppingCart } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    cardBackground: "#fff",
};

export default function ViewOrderScreen() {
    const { order } = useLocalSearchParams();
    const parsedOrder = JSON.parse(order as string);
    const router = useRouter();

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "entregado":
                return <BadgeCheck size={20} color="#008f39" />;
            case "cocinando":
                return <Clock size={20} color="#ffb300" />;
            case "listo para recoger":
                return <Clock size={20} color="#ffb300" />;
            case "listo para pagar":
                return <BadgeCheck size={20} color="#008f39" />;
            default:
                return <ShoppingCart size={20} color={COLORS.primary} />;
        }
    };

    // Agrega esto justo antes del return
    const subtotal = parsedOrder.items.reduce((acc: number, item: { quantity: number; price: number; }) => acc + item.quantity * item.price, 0);
    const taxRate = 0.16; // 16% de IVA
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#a0312e" />
                <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.header}>
                <Ionicons name="document-text-outline" size={30} color={COLORS.primary} style={styles.headerIcon} />
                <Text style={styles.title}>Pedido</Text>
            </View>

            <View style={styles.infoRow}>
                {getStatusIcon(parsedOrder.status)}
                <Text style={styles.infoText}>Estado: {parsedOrder.status}</Text>
            </View>

            <View style={styles.infoRow2}>
                <CalendarDays size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                    {new Date(parsedOrder.timestamp.seconds * 1000).toLocaleString()}
                </Text>
            </View>

            <FlatList
            data={parsedOrder.items}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item }) => (
                <View style={styles.productCard}>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.details}>Cantidad: {item.quantity}</Text>
                    <Text style={styles.details}>
                    Precio unitario: ${item.price}
                    </Text>
                    <Text style={styles.subtotal}>
                    Subtotal: ${item.quantity * item.price}
                    </Text>
                </View>
                </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            />

            <View style={styles.totalContainer}>
                <Ionicons name="card-outline" size={24} color={COLORS.primary} style={styles.totalIcon} />
                <Text style={styles.totalText}>Total a pagar:</Text>
                <Text style={styles.miniText}>+ Impuestos: 16%</Text>
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
        paddingTop: 50,
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
    title: {
        fontSize: 26,
        fontWeight: "700",

        color: COLORS.cardBackground,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoRow2: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.darkText,
    },
    itemCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.darkText,
    },
    itemQuantity: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    emptyText: {
        marginTop: 30,
        textAlign: "center",
        color: "#999",
        fontStyle: "italic",
    },
    headerIcon: {
        marginRight: 10,
        color: COLORS.background,
    },
    productCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        flexDirection: "row",
        gap: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
        elevation: 1,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 8,
        resizeMode: "cover"
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.primary,
        marginBottom: 5
    },
    details: {
        fontSize: 13,
        color: "#555",
    },
    subtotal: {
        fontSize: 13,
        fontWeight: "500",
        marginTop: 4,
        color: "#222",
    },
    totalContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 20,
        padding: 16,
        backgroundColor: "#ffeceb",
        borderRadius: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    totalIcon: {
        marginRight: 10,
    },
    totalText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.primary,
        flex: 1,
        marginBottom: 10
    },
    miniText: {
        fontSize: 8,
        fontWeight: "600",
        color: 'gray',
        right: 132,
        marginTop: 22
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },    
});
