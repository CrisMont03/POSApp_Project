// components/StatusStepper.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatusStepper = ({
    currentStatus,
    onStepChange,
    steps,
    colors,
    }: {
    currentStatus: string;
    onStepChange: (newStatus: string) => void;
    steps: string[];
    colors: any;
    }) => {
    const currentIndex = steps.indexOf(currentStatus);

    return (
    <View style={styles.container}>
        {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
            <Pressable
            key={step}
            onPress={() => onStepChange(step)}
            style={[
                styles.stepContainer,
                isCompleted && { opacity: 0.5 },
            ]}
            >
            <Ionicons
                name={
                isCompleted
                    ? "checkmark-circle"
                    : isActive
                    ? "ellipse"
                    : "ellipse-outline"
                }
                size={20}
                color={colors.primary}
            />
            <Text style={[styles.stepText, isActive && { color: colors.primary }]}>
                {step}
            </Text>
            </Pressable>
        );
        })}
    </View>
    );
};

export default StatusStepper;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 12,
        gap: 12,
    },
    stepContainer: {
        alignItems: "center",
        gap: 4,
    },
    stepText: {
        fontSize: 11,
        color: "#444",
        textAlign: "center",
        maxWidth: 70,
    },
});
