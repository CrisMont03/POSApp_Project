import { supabase } from "@/utils/SupabaseConfig";

export const uploadImage = async (file: Blob, filename: string) => {
    const { data, error } = await supabase.storage
        .from("products") // tu bucket
        .upload(`images/${filename}`, file, {
            contentType: "image/jpeg", // o el tipo que necesites
            upsert: true,
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(`images/${filename}`);

    return publicUrlData.publicUrl;
};