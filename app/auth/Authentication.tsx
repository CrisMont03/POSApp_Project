import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext/AuthContext"; // Asegúrate de importar el contexto correctamente

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, register } = useAuth();
    const router = useRouter();

    const handleSignUp = async () => {
        const success = await register({ email, password });
        if (success) {
            Alert.alert("Registro exitoso", "Cuenta creada correctamente");
            router.replace("/home"); // Redirigir al home
        } else {
            Alert.alert("Error", "No se pudo registrar el usuario");
        }
    };

    const handleSignIn = async () => {
        const success = await login(email, password);
        if (success) {
            Alert.alert("Inicio de sesión exitoso", "Bienvenido");
            router.replace("/home"); // Redirigir al home
        } else {
            Alert.alert("Error", "No se pudo iniciar sesión");
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
