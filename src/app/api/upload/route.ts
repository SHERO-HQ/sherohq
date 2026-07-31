import { NextRequest} from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    // Check auth (allow both admin and public if needed, but here we mirror legacy)
    const admin = await getAdminFromSession();
    
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return apiResponse.error("No file provided", 400);
    }

    // 1. Validate File Type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return apiResponse.error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.", 400);
    }

    // 2. Validate File Size (e.g., 5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return apiResponse.error("File too large. Maximum size is 5MB.", 400);
    }

    // Public upload check (if no admin, check if it's the public endpoint)
    // Legacy had a separate /public route, here we can check the referer or a flag
    const isPublic = formData.get("isPublic") === "true";
    if (!admin && !isPublic) {
      return apiResponse.unauthorized();
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false});

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return apiResponse.success({
      imageUrl: publicUrl,
      filename: fileName});
  } catch (error) {
    console.error("Upload error:", error);
    return apiResponse.error("Failed to upload image");
  }
}
