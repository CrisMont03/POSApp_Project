import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TextInput,
    Modal,
    Pressable,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function ViewMenuScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cartModalVisible, setCartModalVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const user = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setFilteredProducts(
            products.filter((product) =>
                product.name.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, products]);

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const data: Product[] = [];
            querySnapshot.forEach((doc) => {
                const { name, price, description, imageUrl } = doc.data();
                data.push({ id: doc.id, name, price, description, imageUrl });
            });
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    };

    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setModalVisible(true);
    };

    const confirmAddToCart = () => {
        if (!selectedProduct) return;
        const existingItem = cart.find((item) => item.id === selectedProduct.id);
        if (existingItem) {
            existingItem.quantity += quantity;
            setCart([...cart]);
        } else {
            setCart([...cart, { ...selectedProduct, quantity }]);
        }
        setModalVisible(false);
    };

    const confirmOrder = async () => {
        if (!user) return;
        try {
            const mesaId = await AsyncStorage.getItem("mesaId");
    
            await addDoc(collection(db, "cart"), {
                userId: user.uid,
                items: cart,
                mesaId: mesaId || "No asignada", // fallback si no hay QR
                status: "Pedido",
                timestamp: new Date(),
                statusHistory: [
                    {
                        status: "Pedido",
                        timestamp: new Date()
                    }
                ]
            });
            Alert.alert("Éxito", `Tu pedido ha sido enviado${mesaId ? ` desde la mesa ${mesaId}` : ""}`);
            setCart([]);
            setCartModalVisible(false);
        } catch (error) {
            console.error("Error al guardar el carrito: ", error);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const changeQuantity = (id: string, newQty: number) => {
        if (newQty <= 0) return removeFromCart(id);
        setCart(
            cart.map((item) =>
                item.id === id ? { ...item, quantity: newQty } : item
            )
        );
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#a0312e" />
                <Text style={styles.backText}>Volver</Text>
            </Pressable>
                
            <View style={styles.header}>
                <TextInput
                    placeholder="🔍 Buscar producto"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.searchBar}
                />
                <TouchableOpacity onPress={() => setCartModalVisible(true)}>
                    <Ionicons name="cart" size={28} color={COLORS.primary} />
                    {cart.length > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                <View style={styles.cardHorizontal}>
                    {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.imageHorizontal} />
                    )}
                    <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text numberOfLines={2} style={styles.productDesc}>{item.description}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <Pressable style={styles.addButton} onPress={() => openModal(item)}>
                        <Text style={styles.buttonText}>Agregar al carrito</Text>
                    </Pressable>
                    </View>
                </View>
                )}                  
            />

            {/* Modal para seleccionar cantidad */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBackground}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>¿Cuántas deseas?</Text>
                        <Text style={styles.productName}>{selectedProduct?.name}</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={quantity.toString()}
                            onChangeText={(val) => setQuantity(Number(val))}
                            style={styles.quantityInput}
                        />
                        <Pressable style={styles.confirmButton} onPress={confirmAddToCart}>
                            <Text style={styles.buttonText}>Confirmar</Text>
                        </Pressable>
                        <Pressable onPress={() => setModalVisible(false)}>
                            <Text style={{ marginTop: 10, color: COLORS.primary }}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Modal del carrito */}
            <Modal visible={cartModalVisible} animationType="slide" transparent>
                <View style={styles.modalBackground}>
                    <View style={[styles.modalView, { height: "80%" }]}> 
                        <Text style={styles.modalTitle}>Tu carrito</Text>
                        <ScrollView style={{ width: "100%" }}>
                            {cart.map((item) => (
                                <View key={item.id} style={{ marginBottom: 15 }}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text>Cantidad:</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={item.quantity.toString()}
                                        onChangeText={(val) => changeQuantity(item.id, Number(val))}
                                        style={styles.quantityInput}
                                    />
                                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                        <Text style={{ color: "red" }}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        <Pressable style={styles.confirmButton} onPress={confirmOrder}>
                            <Text style={styles.buttonText}>      Pedir      </Text>
                        </Pressable>
                        <Pressable onPress={() => setCartModalVisible(false)}>
                            <Text style={{ marginTop: 10, color: COLORS.primary }}>Cerrar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const COLORS = {
    primary: "#a0312e",
    darkText: "#333",
    background: "#fff5f4",
    accent: "#fff",
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
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
    searchBar: {
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        flex: 1,
        marginRight: 10,
    },
    cartBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "red",
        borderRadius: 10,
    paddingHorizontal: 6,
    },
    cartBadgeText: {
        color: "#fff",
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    image: {
        width: "100%",
        height: 160,
        borderRadius: 10,
        marginBottom: 10,
    },
    productName: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.darkText,
    },
    productDesc: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // gris con transparencia
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        backgroundColor: "#fff",
        margin: 30,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 10,
        maxHeight: "90%",
        width: "60%", // puedes ajustar este valor
        alignSelf: "center", // centra horizontalmente
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: COLORS.primary,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        width: 60,
        height: 40,
        textAlign: "center",
        borderRadius: 8,
        marginVertical: 10,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    cardHorizontal: {
        flexDirection: "row",
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
        alignItems: "center",
    },
    imageHorizontal: {
        width: 130,
        height: 200,
        borderRadius: 10,
        resizeMode: "cover",
        paddingRight: 10
    },  
});
