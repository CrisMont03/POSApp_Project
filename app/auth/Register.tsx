import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable,
    StyleSheet, Modal,
    Animated, Easing
} from "react-native";
import { useAuth } from "@/context/authContext/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import { auth, db } from "@/utils/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const RegisterScreen = () => {
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        birthdate: "",
    });
    const router = useRouter();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password || !form.phone || !form.birthdate) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
        }

        const birthDate = new Date(form.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (age < 18 || (age === 18 && monthDiff < 0)) {
        Alert.alert("Error", "Debes tener al menos 18 años para registrarte");
        return;
        }

        const success = await register(form);
        if (success && auth.currentUser) {
            Alert.alert("Éxito", "Usuario registrado correctamente");
            try {
                const uid = auth.currentUser.uid;
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const role = userData.role;

                    Alert.alert("Inicio de sesión exitoso", `Bienvenido, rol: ${role}`);

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
            Alert.alert("Error", "No se pudo registrar el usuario");
        }
    };

    //Roles
    const getRoleOptions = () => {
        if (!form.email) return ["En espera..."];
        
        if (form.email.includes("@rinconsabanero.co")) {
            return ["Chef", "Administrador"];
        }
        
        return ["Cliente"];
    };

    //Animación del modal
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showDatePicker) {
            Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [showDatePicker]);

    const handleConfirmDate = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
            }),
            Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
            }),
        ]).start(() => {
            setShowDatePicker(false);
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1}}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
                    style={{ flex: 1 }}
                >
                    <View  style={styles.container}>
                        <Text style={styles.title}>Registro</Text>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            placeholder="Ej. Heriberto Pérez Rosales"
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            style={styles.input}
                            placeholderTextColor="#aaa"
                        />

                        <Text style={styles.label}>Correo</Text>
                        <TextInput
                            placeholder="Ej. ejemplo@correo.com"
                            value={form.email}
                            onChangeText={(text) => setForm({ ...form, email: text })}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#aaa"
                        />

                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            placeholder="Escribe tu contraseña"
                            value={form.password}
                            onChangeText={(text) => setForm({ ...form, password: text })}
                            style={styles.input}
                            secureTextEntry
                            placeholderTextColor="#aaa"
                        />

                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            placeholder="Ej. +57 3021123456"
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            style={styles.input}
                            keyboardType="phone-pad"
                            placeholderTextColor="#aaa"
                        />

                        <Text style={styles.label}>Rol</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                        {getRoleOptions().map((roleOption, index) => (
                            <TouchableOpacity
                            key={index}
                            onPress={() => {
                                if (roleOption !== "En espera...") {
                                setForm({ ...form, role: roleOption });
                                }
                            }}
                            style={[
                                styles.roleButton,
                                form.role === roleOption && styles.roleButtonSelected,
                                roleOption === "En espera..." && styles.roleButtonDisabled,
                            ]}
                            disabled={roleOption === "En espera..."}
                            >
                            <Text
                                style={[
                                styles.roleButtonText,
                                form.role === roleOption && styles.roleButtonTextSelected,
                                roleOption === "En espera..." && styles.roleButtonTextDisabled,
                                ]}
                            >
                                {roleOption}
                            </Text>
                            </TouchableOpacity>
                        ))}
                        </View>

                        <Text style={styles.label}>Fecha de nacimiento</Text>
                        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setShowDatePicker(true);}} style={styles.input}>
                            <Text style={form.birthdate ? styles.birthdateText : styles.placeholderText}>
                            {form.birthdate ? form.birthdate : "Selecciona tu fecha de nacimiento"}
                            </Text>
                        </TouchableOpacity>

                        <Modal
                            visible={showDatePicker}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.modalContainer}>
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    {
                                    transform: [{ scale: scaleAnim }],
                                    opacity: opacityAnim,
                                    },
                                ]}
                            >
                                    {showDatePicker && (
                                        <>
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                setDate(selectedDate);
                                                setForm({
                                                ...form,
                                                birthdate: selectedDate.toISOString().split("T")[0],
                                                });
                                            }
                                            if (Platform.OS === "android") setShowDatePicker(false);
                                            }}
                                        />
                                        {Platform.OS === "ios" && (
                                            <Pressable style={styles.buttonModal} onPress={handleConfirmDate}>
                                            <Text style={styles.buttonTextModal}>Confirmar</Text>
                                            </Pressable>
                                        )}
                                        </>
                                    )}
                                </Animated.View>
                            </View>
                        </Modal>

                        <View style={styles.buttonWrapper}>
                            <Pressable style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Registrarse</Text>
                            </Pressable>
                        </View>
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
    //Estilos generales
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: COLORS.inputBackground,
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
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
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

        birthdateText: {
            color: COLORS.text,
        },
        placeholderText: {
            color: "#aaa",

        },

        //Estilos del modal
        modalContainer: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 100,
        },
        modalContent: {
            backgroundColor: COLORS.primary,
            padding: 20,
            borderRadius: 30,
            alignItems: "center",
        },
        buttonModal: {
            backgroundColor: COLORS.background,
            paddingVertical: 14,
            alignItems: "center",
            borderRadius: 10,
        },
        buttonTextModal: {
            color: COLORS.primary,
            fontWeight: "600",
            fontSize: 16,
            paddingHorizontal: 150,
        },  

        //Estilos de Rol
        roleButton: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: COLORS.background,
            borderWidth: 1.5,
            borderColor: COLORS.accent,
        },
        roleButtonSelected: {
            backgroundColor: COLORS.primary,
        },
        roleButtonDisabled: {
            backgroundColor: "#EEEEEE",
        },
        roleButtonText: {
            color: "",
            fontWeight: "400",
        },
        roleButtonTextSelected: {
            color: "#fff",
        },
        roleButtonTextDisabled: {
            color: "#aaa",
        },
});

export default RegisterScreen;


