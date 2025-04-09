import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const STATUS_STEPS = [
  "Pedido",
  "Cocinando",
  "Listo para recoger",
  "Entregado",
  "Listo para pagar",
];

export default function ViewOrderScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "cart"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => STATUS_STEPS.indexOf(status);

  const renderProgressBar = (status: string) => {
    const currentStep = getStatusStep(status);
    return (
      <View style={styles.progressContainer}>
        {STATUS_STEPS.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                { backgroundColor: index <= currentStep ? "#a0312e" : "#ccc" },
              ]}
            />
            <Text style={styles.stepLabel}>{step}</Text>
            {index < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: index < currentStep ? "#a0312e" : "#ccc" },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#a0312e" />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <Text style={styles.orderTitle}>Pedido: {item.id}</Text>
          <Text style={styles.orderSubtitle}>Estado actual: {item.status}</Text>
          <Text style={styles.timestamp}>
            Fecha: {new Date(item.timestamp?.toDate?.()).toLocaleString()}
          </Text>
          {renderProgressBar(item.status)}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a0312e",
    marginBottom: 5,
  },
  orderSubtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  stepContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    margin: 4,
  },
  stepLabel: {
    fontSize: 10,
    color: "#333",
    marginRight: 6,
  },
  line: {
    height: 2,
    width: 20,
  },
});
