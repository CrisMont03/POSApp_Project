import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BarcodeScanningResult } from "expo-camera";


export default function ScanQRScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        // if (!data.startsWith("Mesa_")) {
        // Alert.alert("Código inválido", "El código QR escaneado no es una mesa válida.");
        // return;
        // }
    
        await AsyncStorage.setItem("mesaId", data);
        Alert.alert("Código escaneado", `Mesa asignada: ${data}`);
        router.replace("/menuCliente"); // va al menú cliente
    };

    if (!permission) {
        // Permiso aún no resuelto
        return <Text>Solicitando permisos...</Text>;
    }

    if (!permission.granted) {
        return (
        <View style={styles.container}>
            <Text>Necesitamos permiso para usar la cámara.</Text>
            <Button title="Conceder permiso" onPress={requestPermission} />
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Escanea el código QR de tu mesa</Text>
        <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
            barcodeTypes: ["qr"],
            }}
            style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
            <Button title={"Escanear otro"} onPress={() => setScanned(false)} />
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        position: "absolute",
        top: 50,
        fontSize: 18,
        fontWeight: "bold",
        zIndex: 1,
    },
});
