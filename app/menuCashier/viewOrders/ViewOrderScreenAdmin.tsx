import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image, Modal, Alert, ScrollView} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BadgeCheck, Clock, CalendarDays, ShoppingCart } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig";
import { useState } from "react";

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    cardBackground: "#fff",
};

export default function ViewOrderScreenAdmin() {
    const { order } = useLocalSearchParams();
    const parsedOrder = JSON.parse(order as string);
    const router = useRouter();

    //Variables para calculos del recibo
    const [showInvoice, setShowInvoice] = useState(false);
    const subtotal = parsedOrder.items.reduce((acc: number, item: { quantity: number; price: number; }) => acc + item.quantity * item.price, 0);
    const taxRate = 0.16; // 16% de IVA
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    //Generar el pdf
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [clientName, setClientName] = useState("Cliente");

    React.useEffect(() => {
        const fetchClientName = async () => {
            try {
                if (parsedOrder.userId) {
                    const userRef = doc(db, "users", parsedOrder.userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setClientName(userData.name || "Cliente");
                    }
                }
            } catch (error) {
                console.error("Error al obtener el nombre del cliente:", error);
            }
        };
        fetchClientName();
    }, []);

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

    const handlePayment = async () => {
        try {
            const orderRef = doc(db, "cart", parsedOrder.id);
            const subtotal = parsedOrder.items.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);
            const taxes = subtotal * 0.16;
            const total = subtotal + taxes;
    
            // 1. Actualizar estado en Firestore
            await updateDoc(orderRef, {
                status: "Pagado",
                [`statusHistory.Pagado`]: {
                    timestamp: serverTimestamp(),
                },
            });
    
            // 2. Crear recibo en Firestore
            await addDoc(collection(db, "receipts"), {
                orderId: parsedOrder.id,
                items: parsedOrder.items,
                subtotal,
                taxes,
                total,
                timestamp: new Date()
            });
    
            // 3. Generar archivo HTML
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 24px;
                        background-color: #fefefe;
                        color: #333;
                    }
                    h1 {
                        text-align: center;
                        color: #a0312e;
                    }
                    .info {
                        margin-bottom: 20px;
                    }
                    .info p {
                        margin: 4px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 16px;
                    }
                    th, td {
                        border: 1px solid #aaa;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2dede;
                    }
                    tfoot td {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <h1>Recibo de pago</h1>
                <div class="info">
                    <p><strong>Cliente:</strong> ${clientName}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${parsedOrder.items.map((item: any) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3">Subtotal</td>
                            <td>$${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3">Impuestos (16%)</td>
                            <td>$${taxes.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3">Total</td>
                            <td>$${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </body>
            </html>
            `;

    
            const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "_"); // Quita caracteres especiales
            const fileUri = `${FileSystem.documentDirectory}recibo_${safeName}.html`;

            await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });
    
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Recibo generado", "El HTML fue guardado en: " + fileUri);
            }
    
            setShowInvoiceModal(false);
            router.back();
    
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            Alert.alert("Error", "Hubo un problema al procesar el pago.");
        }
    };    
    

    // Agrega esto justo antes del return
    const total = parsedOrder.items.reduce((acc: number, item: { quantity: number; price: number; }) => acc + item.quantity * item.price, 0);

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
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>

            {parsedOrder.status === "Listo para pagar" && (
                <Pressable style={styles.payButton} onPress={() => setShowInvoiceModal(true)}>
                    <Text style={styles.payButtonText}>Pagar</Text>
                </Pressable>
            )}

            <Modal visible={showInvoiceModal} transparent animationType="slide">
                <View style={{
                    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center", alignItems: "center",
                }}>
                    <View style={{
                        backgroundColor: "#fff", padding: 20, borderRadius: 10,
                        width: "90%", maxHeight: "80%"
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Factura</Text>
                        <ScrollView>
                            {parsedOrder.items.map((item: any, idx: number) => (
                                <View key={idx} style={{ marginBottom: 10 }}>
                                    <Text>{item.name} x{item.quantity}</Text>
                                    <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}
                            <Text style={{ marginTop: 10 }}>Subtotal: ${total.toFixed(2)}</Text>
                            <Text>Impuestos (16%): ${(total * 0.16).toFixed(2)}</Text>
                            <Text style={{ fontWeight: "bold" }}>Total: ${(total * 1.16).toFixed(2)}</Text>
                        </ScrollView>
                        <Pressable
                            onPress={handlePayment}
                            style={{ backgroundColor: COLORS.primary, padding: 10, marginTop: 20, borderRadius: 8, alignItems: "center" }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirmar pago</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setShowInvoiceModal(false)}
                            style={{ marginTop: 10, alignItems: "center" }}
                        >
                            <Text style={{ color: "#a0312e" }}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

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
        marginBottom: 15,
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
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    payButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    payButtonText: {
        color: COLORS.cardBackground,
        fontSize: 18,
        fontWeight: "bold",
    },
});
