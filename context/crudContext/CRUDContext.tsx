import { db } from "@/utils/FirebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { supabase } from "@/utils/SupabaseConfig";

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
    
    // Obtiene el documento actual
    const snapshot = await getDocs(productsRef);
    const productData = snapshot.docs.find(doc => doc.id === id)?.data();

    if (productData?.imageUrl) {
        await deleteOldImage(productData.imageUrl);
    }

    // Luego elimina el documento de Firestore
    await deleteDoc(productDoc);
};

export const deleteOldImage = async (url: string) => {
    try {
        // Extrae el path después de `/images/`
        const match = url.match(/\/images\/(.+)$/);
        if (!match || match.length < 2) {
            console.error("❌ No se pudo extraer el path de la imagen desde la URL:", url);
            return;
        }

        const path = match[1].trim(); // Por si hay espacios ocultos
        console.log("🗑️ Intentando eliminar:", `"${path}"`);

        // Diagnóstico opcional: mostrar archivos actuales
        const listResult = await supabase.storage.from("images").list();
        console.log("📂 Archivos actuales en bucket:");
        listResult.data?.forEach(file => console.log("→", `"${file.name}"`));

        // Intentar eliminar el archivo
        const { data, error } = await supabase.storage
            .from("images")
            .remove([path]);

        if (error) {
            console.error("❌ Error al eliminar la imagen:", error);
        } else {
            console.log("✅ Imagen eliminada correctamente:", data);
        }
    } catch (err) {
        console.error("🔥 Error general al intentar eliminar imagen:", err);
    }
};
