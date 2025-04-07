import { db } from "@/utils/FirebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp
} from "firebase/firestore";

const productsRef = collection(db, "products");

// Create
export const addProduct = async (product: any) => {
    const newProduct = {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    await addDoc(productsRef, newProduct);
};

// Read
export const getProducts = async () => {
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update
export const updateProduct = async (id: string, updatedProduct: any) => {
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, updatedProduct);
};

// Delete
export const deleteProduct = async (id: string) => {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
};
