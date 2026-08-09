import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";
import { validateUploadedFile } from "@/lib/upload-validation";

export async function POST(request: NextRequest) {
  try {
    // Check auth (allow both admin and public if needed, but here we mirror legacy)
    const admin = await getAdminFromSession();

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return apiResponse.error("No file provided", 400);
    }

    const validation = validateUploadedFile(file);
    if (!validation.ok) {
      return apiResponse.error(validation.error, 400);
    }

    if (!admin) {
      return apiResponse.unauthorized();
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileExt = safeFileName.split(".").pop() || "bin";
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath);

    return apiResponse.success({
      imageUrl: publicUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return apiResponse.error("Failed to upload image");
  }
}
