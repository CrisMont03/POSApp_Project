import React, { createContext, useContext, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

interface AuthContextInterface {
    login: (email: string, password: string) => Promise<boolean>;
    register: (user: any) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (user: any) => Promise<void>;
    updateRole: (role: "client" | "chef" | "cashier") => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            return true;
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            return false;
        }
    };

    const register = async (userData: any) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            setUser(userCredential.user);
            return true;
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigation.navigate("home" as never); // Asegúrate de que "Login" es una pantalla válida en tu navegación
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, updateUser: async () => {}, updateRole: async () => {} }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
