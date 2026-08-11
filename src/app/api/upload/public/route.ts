import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return apiResponse.error("No image file provided", 400);
    }

    // Stricter size limit for public uploads (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return apiResponse.error("Image too large (max 2MB)", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return apiResponse.success({
      success: true,
      imageUrl: publicData.publicUrl,
    });

  } catch (error) {
    console.error("Public upload error:", error);
    return apiResponse.error("Failed to upload image", 500);
  }
}
