import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig"
import { useRouter } from "expo-router";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSignUp = async () => {
        try {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Registro exitoso", "Cuenta creada correctamente");
        router.replace("/home"); // Redirigir al home
        } catch (error) {
        Alert.alert("Error");
        }
    };

    const handleSignIn = async () => {
        try {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Inicio de sesión exitoso", "Bienvenido");
        router.replace("/home"); // Redirigir al home
        } catch (error) {
        Alert.alert("Error");
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>Autenticación</Text>
        
        <Text>Email:</Text>
        <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
        />

        <Text>Contraseña:</Text>
        <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <Button title="Iniciar Sesión" onPress={handleSignIn} />
        <Button title="Registrarse" onPress={handleSignUp} color="green" />
        </View>
    );
}
