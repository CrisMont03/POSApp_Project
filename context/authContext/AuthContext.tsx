import React, { createContext, useContext, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig";
import { useRouter } from "expo-router";

interface AuthContextInterface {
    login: (email: string, password: string) => Promise<boolean>;
    register: (user: any) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (user: any) => Promise<void>;
    updateRole: (role: "client" | "chef" | "cashier") => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const register = async (userData: any): Promise<boolean> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            setUser(userCredential.user);
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
            setUser(null);
            router.push("/home");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const updateUser = async (userData: any): Promise<void> => {
        setUser((prev: any) => ({ ...prev, ...userData }));
    };

    const updateRole = async (role: "client" | "chef" | "cashier"): Promise<void> => {
        setUser((prev: any) => ({ ...prev, role }));
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, updateUser, updateRole }}>
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
