// src/styles/styles.ts
import { StyleSheet } from "react-native";

const COLORS = {
  primary: "#a0312e",
  secondary: "#b74b46",
  accent: "#cf665e",
  lightAccent: "#e78076",
  background: "#fff",
  inputBackground: "#fff5f4",
  text: "#333",
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.background,
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
});

export default globalStyles;
export { COLORS };
