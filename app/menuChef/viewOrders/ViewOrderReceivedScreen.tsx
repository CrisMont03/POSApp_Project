import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Pressable
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BadgeCheck, Clock, CalendarDays, ShoppingCart } from "lucide-react-native";

const COLORS = {
    primary: "#a0312e",
    text: "#333",
    background: "#fff5f4",
    card: "#fff",
};

export default function ViewOrderReceivedScreen() {
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
            default:
                return <ShoppingCart size={20} color={COLORS.primary} />;
        }
    };

    return (
    <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#a0312e" />
            <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <View style={styles.header}>
            <Ionicons name="receipt" size={24} color={COLORS.card} />
            <Text style={styles.title}>Detalle del Pedido</Text>
        </View>
        
        <View style={styles.infoRow}>
            {getStatusIcon(parsedOrder.status)}
            <Text style={styles.infoText}>Estado: {parsedOrder.status}</Text>
        </View>

        <View style={styles.infoRow}>
            <CalendarDays size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
                {new Date(parsedOrder.timestamp.seconds * 1000).toLocaleString()}
            </Text>
        </View>

        <Text style={styles.subtitle}>Productos:</Text>

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
        padding: 17,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.card,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    info: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.text,
    },
    productCard: {
        backgroundColor: COLORS.card,
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
});
