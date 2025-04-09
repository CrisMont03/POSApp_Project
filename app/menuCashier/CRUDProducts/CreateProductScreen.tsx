import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image,
    SafeAreaView, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform
} from "react-native";
import { useRouter } from "expo-router";
import { addProduct } from "@/context/crudContext/CRUDContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/utils/supabaseService/UploadService"; // tu servicio supabase

const CreateProductScreen = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(20000); // Slider inicia en 20000
    const [category, setCategory] = useState("");
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);

    // Guardar la imagen
    const [imageUri, setImageUri] = useState(""); // URI local de la imagen
    const [imageUrl, setImageUrl] = useState("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name || !price || !category) {
            Alert.alert("Campos requeridos", "Nombre, precio y categoría son obligatorios.");
            return;
        }
    
        try {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 2000);
    
            let finalImageUrl = "";
            if (imageBase64 && filename) {
                finalImageUrl = await uploadImage(imageBase64, filename); // Subida exitosa
            }
    
            const product = {
                name,
                description,
                price: parseFloat(price.toString()),
                category,
                imageUrl: finalImageUrl,
            };
    
            await addProduct(product);
            router.back();
        } catch (error) {
            Alert.alert("Error", "No se pudo crear el producto.");
        }
    };
    
    const handleSelectImage = async () => {
        Alert.alert(
            "Seleccionar imagen",
            "¿De dónde quieres obtener la imagen?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Tomar foto",
                    onPress: async () => {
                        const cameraResult = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.8,
                            base64: true,
                        });
    
                        if (!cameraResult.canceled && cameraResult.assets.length > 0) {
                            const asset = cameraResult.assets[0];
                            const uri = asset.uri;
                            const base64 = asset.base64;
                            const mimeType = asset.mimeType || "image/jpeg";
                            const ext = mimeType === "image/png" ? "png" : "jpg";
                            const filename = `${Date.now()}_camera.${ext}`;
    
                            setImageUri(uri);
                            setImageBase64(base64 || null);
                            setFilename(filename);
                        }
                    },
                },
                {
                    text: "Elegir de la galería",
                    onPress: async () => {
                        const galleryResult = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.8,
                            base64: true,
                        });
    
                        if (!galleryResult.canceled && galleryResult.assets.length > 0) {
                            const asset = galleryResult.assets[0];
                            const uri = asset.uri;
                            const base64 = asset.base64;
                            const mimeType = asset.mimeType || "image/jpeg";
                            const ext = mimeType === "image/png" ? "png" : "jpg";
                            const filename = `${Date.now()}_gallery.${ext}`;
    
                            setImageUri(uri);
                            setImageBase64(base64 || null);
                            setFilename(filename);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };    

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Necesitas dar permiso para acceder a la cámara.");
            }
        })();
    }, []);

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
                        {imageUri ? (
                            <View style={{ alignItems: "center", marginVertical: 10 }}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: 300, height: 200, borderRadius: 10 }}
                                    resizeMode="cover"
                                />
                            </View>
                        ) : null}

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
