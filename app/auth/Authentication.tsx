import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, TouchableOpacity, StyleSheet, SafeAreaView,
    TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, Image} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/utils/FirebaseConfig";
import { supabase } from "@/utils/SupabaseConfig";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const [isFlashing, setIsFlashing] = useState(false);

    const handleNavigateToRegister = () => {
        router.push("/auth/Register");
    };

    const handleSignIn = async () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 2000); // Parpadea
        console.log("Botón presionado");
        
        const success = await login(email, password);
        if (success && auth.currentUser) {
            try {
                const uid = auth.currentUser.uid;
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const role = userData.role;

                    if (role === "Cliente") router.replace("/menuCliente");
                    else if (role === "Chef") router.replace("/menuChef");
                    else if (role === "Administrador") router.replace("/menuCashier");
                    else Alert.alert("Error", "Rol no reconocido");

                } else {
                    Alert.alert("Error", "No se encontró información del usuario");
                }
            } catch (err) {
                console.error("Error al obtener datos del usuario:", err);
                Alert.alert("Error", "Hubo un problema al obtener tus datos");
            }
        } else {
            Alert.alert("Error", "No se pudo iniciar sesión");
        }
    };

    useEffect(() => {
        const restoreSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
            console.log("🔴 No hay sesión activa");
            } else {
            console.log("🟢 Sesión restaurada:", data.session.user.email);
            }
        };
        
        restoreSession();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1}}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.container}>
                        {/* Logo centrado arriba */}
                        <Image
                            source={require("../../assets/images/elRinconSabanero.png")} // Ajusta la ruta según la ubicación de tu logo
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Bienvenido</Text>

                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.buttonWrapper}>
                            <Pressable style={[styles.button, isFlashing && styles.flash]} onPress={handleSignIn}>
                                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                            </Pressable>
                        </View>

                        <TouchableOpacity onPress={handleNavigateToRegister} style={{ marginTop: 20 }}>
                            <Text style={{ color: COLORS.accent, textAlign: "center" }}>
                                ¿No tienes una cuenta? <Text style={{ fontWeight: "bold" }}>Regístrate</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

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
        justifyContent: "center",
        padding: 24,
        backgroundColor: COLORS.background,
    },
    logo: {
        width: 150, // Ajusta el ancho según el tamaño deseado
        height: 150, // Ajusta la altura según el tamaño deseado
        alignSelf: "center", // Centra el logo horizontalmente
        marginBottom: 20, // Espacio entre el logo y el título
    },
    title: {
        fontSize: 26,
        textAlign: "center",
        color: COLORS.primary,
        fontWeight: "bold",
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.accent,
        marginBottom: 16,
        color: COLORS.text,
    },
    buttonWrapper: {
        marginTop: 12,
        borderRadius: 10,
        overflow: "hidden",
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: COLORS.accent,
        marginTop: 10,
    },
    flash: {
        backgroundColor: "#ff9b8e", // Color que parpadea
    },
});