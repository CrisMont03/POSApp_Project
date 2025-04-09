import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, StyleSheet,
    SafeAreaView, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform
    } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getProducts, deleteProduct } from "@/context/crudContext/CRUDContext";
import { Ionicons } from "@expo/vector-icons";

const ProductListScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Eliminar producto", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    await deleteProduct(id);
                    fetchProducts();
                },
            },
        ]);
    };

    const addNewProduct = async () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500); // Parpadea
        console.log("Botón presionado");

        router.push("/menuCashier/CRUDProducts/CreateProductScreen")
    }

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1}}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.container}>
                        {/* Botón de regreso */}
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#a0312e" />
                            <Text style={styles.backText}>Volver</Text>
                        </Pressable>

                        <Text style={styles.title}>Lista de Productos</Text>
                        <Pressable style={[styles.button, isFlashing && styles.flash]} onPress={addNewProduct}>
                            <Text style={styles.buttonText}>+ Agregar nuevo producto</Text>
                        </Pressable>
                        <FlatList
                            data={products}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text>${item.price}</Text>
                                    <View style={styles.actions}>
                                        <Pressable onPress={() => router.push({ pathname: "/menuCashier/CRUDProducts/EditProductScreen", params: { product: JSON.stringify(item) } })}>
                                            <Text style={styles.edit}>Editar</Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleDelete(item.id)}>
                                            <Text style={styles.delete}>Eliminar</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backText: {
        marginLeft: 6,
        color: "#a0312e",
        fontSize: 16,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#a0312e",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
    card: {
        backgroundColor: "#fff5f4",
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
    },
    name: { fontSize: 18, fontWeight: "bold" },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    edit: { color: "#b74b46" },
    delete: { color: "#cf665e" },
    flash: {
        backgroundColor: "#ff9b8e", // Color que parpadea
    },
});

export default ProductListScreen;