import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, 
    SafeAreaView, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform
} from "react-native";
import { useRouter } from "expo-router";
import { addProduct } from "@/context/crudContext/CRUDContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/utils/supabaseService/UploadService"; // tu servicio supabase
import * as FileSystem from "expo-file-system";

const CreateProductScreen = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(20000); // Slider inicia en 20000
    const [category, setCategory] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);

    const handleCreate = async () => {
        if (!name || !price || !category) {
            Alert.alert("Campos requeridos", "Nombre, precio y categoría son obligatorios.");
            return;
        }

        const product = {
            name,
            description,
            price: parseFloat(price.toString()),
            category,
            imageUrl,
        };

        try {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 2000);
            await addProduct(product);
            router.back();
        } catch (error) {
            Alert.alert("Error", "No se pudo crear el producto.");
        }
    };

    const handleSelectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
    
        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            const filename = `${Date.now()}_image.jpg`;
    
            const response = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
    
            const blob = new Blob([Uint8Array.from(atob(response), c => c.charCodeAt(0))], {
                type: "image/jpeg",
            });
    
            try {
                const url = await uploadImage(blob, filename);
                setImageUrl(url); // este es el URL que se guarda en Firestore
            } catch (err) {
                console.error("Error al subir la imagen", err);
                Alert.alert("Error", "No se pudo subir la imagen");
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.container}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#a0312e" />
                            <Text style={styles.backText}>Volver</Text>
                        </Pressable>

                        <Text style={styles.title}>Nuevo Producto</Text>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            placeholder="Nombre"
                            placeholderTextColor="#aaa"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            placeholder="Descripción"
                            placeholderTextColor="#aaa"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Precio: ${price.toLocaleString()}</Text>
                        <Slider
                            style={{ width: "100%", height: 40 }}
                            minimumValue={20000}
                            maximumValue={80000}
                            step={1000}
                            minimumTrackTintColor="#a0312e"
                            maximumTrackTintColor="#e0e0e0"
                            value={price}
                            onValueChange={setPrice}
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <View style={styles.categoryContainer}>
                        {["Desayuno", "Comida", "Cena"].map((item) => {
                            const isSelected = category === item.toLowerCase();
                            return (
                                <Pressable
                                    key={item}
                                    onPress={() => setCategory(item.toLowerCase())}
                                    style={[
                                        styles.categoryButton,
                                        isSelected && styles.categorySelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        isSelected && styles.categoryTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                </Pressable>
                            );
                        })}
                        </View>

                        <Text style={styles.label}>Imagen</Text>
                        <Pressable style={styles.button} onPress={handleSelectImage}>
                            <Text style={styles.buttonText}>
                                {imageUrl ? "Imagen seleccionada" : "Seleccionar imagen"}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, isFlashing && styles.flash]}
                            onPress={handleCreate}
                        >
                            <Text style={styles.buttonText}>Guardar</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

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
        padding: 20,
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: COLORS.inputBackground,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: COLORS.background,
        textAlign: "center",
        fontWeight: "600",
    },
    flash: {
        backgroundColor: "#ff9b8e",
    },
    label: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 6,
    },
    categoryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    categoryButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 8,
        backgroundColor: COLORS.inputBackground,
    },
    categorySelected: {
        backgroundColor: COLORS.primary,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    categoryText: {
        textAlign: "center",
        color: COLORS.text,
        fontWeight: "500",
    },
    categoryTextSelected: {
        color: COLORS.background, // texto blanco cuando está seleccionado
        fontWeight: "600",
    }
});

export default CreateProductScreen;
