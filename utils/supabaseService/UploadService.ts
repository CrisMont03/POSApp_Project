import { supabase } from "@/utils/SupabaseConfig";
import { decode } from "base64-arraybuffer";

// Como Expo no usa APIs nativas como Blob directamente, uso base64 para enviar la información de la imagen y despues
// convertirla de vuelta a binario (Uint8Array) para poder subirla a Supabase u otros servidores.

export const uploadImage = async (base64: string, filename: string, contentType = "image/jpeg") => {
    try {
        // Elimina encabezado si lo hay
        const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

        // Decodifica base64 a ArrayBuffer
        const arrayBuffer = decode(cleanedBase64);
        const uint8Array = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase.storage
            .from("images")
            .upload(filename, uint8Array, {
                contentType,
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from("images")
            .getPublicUrl(filename);

        console.log("Imagen subida correctamente");
        return publicUrlData?.publicUrl || "";
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        throw error;
    }
};

