import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Alert,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { updateProduct } from "@/context/crudContext/CRUDContext";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";

const EditProductScreen = () => {
    const router = useRouter();
    const { product } = useLocalSearchParams();
    const parsedProduct = product ? JSON.parse(product as string) : {};

    const [name, setName] = useState(parsedProduct.name || "");
    const [description, setDescription] = useState(parsedProduct.description || "");
    const [price, setPrice] = useState(parsedProduct.price || 20000);
    const [category, setCategory] = useState(parsedProduct.category || "");
    const [imageUrl, setImageUrl] = useState(parsedProduct.imageUrl || "");
    const [isFlashing, setIsFlashing] = useState(false);

    const handleUpdate = async () => {
        if (!name || !price || !category) {
            Alert.alert("Error", "Nombre, precio y categoría son obligatorios");
            return;
        }

        try {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 2000);

            await updateProduct(parsedProduct.id, {
                name,
                description,
                price,
                category,
                imageUrl,
                updatedAt: Timestamp.now(),
            });

            Alert.alert("Éxito", "Producto actualizado");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo actualizar el producto");
        }
    };

    const CATEGORIES = ["Desayuno", "Comida", "Cena"];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.container}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#a0312e" />
                            <Text style={styles.backText}>Volver</Text>
                        </Pressable>

                        <Text style={styles.title}>Editar Producto</Text>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            placeholder="Nombre del platillo"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            placeholder="Descripción"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            style={[styles.input, { height: 80 }]}
                        />

                        <Text style={styles.label}>Precio: ${price.toLocaleString()}</Text>
                        <Slider
                            minimumValue={20000}
                            maximumValue={80000}
                            step={1000}
                            value={price}
                            onValueChange={setPrice}
                            style={{ marginBottom: 16 }}
                            minimumTrackTintColor="#a0312e"
                            maximumTrackTintColor="#ccc"
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                            {CATEGORIES.map((item) => {
                                const isSelected = category === item.toLowerCase();
                                return (
                                    <Pressable
                                        key={item}
                                        onPress={() => setCategory(item.toLowerCase())}
                                        style={[
                                            styles.categoryButton,
                                            isSelected && styles.categorySelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                isSelected && styles.categoryTextSelected,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={styles.label}>Imagen</Text>
                        <TextInput
                            placeholder="URL de imagen (opcional)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            style={styles.input}
                        />

                        <Pressable
                            style={[styles.button, isFlashing && styles.flash]}
                            onPress={handleUpdate}
                        >
                            <Text style={styles.buttonText}>Actualizar</Text>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
    },
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff5f4",
        padding: 12,
        marginBottom: 16,
        borderRadius: 10,
        borderColor: "#cf665e",
        borderWidth: 1,
    },
    button: {
        backgroundColor: "#a0312e",
        padding: 14,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        color: "#a0312e",
        marginBottom: 6,
    },
    flash: {
        backgroundColor: "#ff9b8e",
    },
    categoryButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        borderColor: "#a0312e",
        borderWidth: 1,
        backgroundColor: "#fff",
    },
    categorySelected: {
        backgroundColor: "#a0312e",
        borderWidth: 1.5,
        borderColor: "#a0312e",
    },
    categoryText: {
        textAlign: "center",
        color: "#a0312e",
        fontWeight: "500",
    },
    categoryTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default EditProductScreen;
