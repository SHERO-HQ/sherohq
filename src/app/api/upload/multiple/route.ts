import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return apiResponse.error("No files provided", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_SIZE = 5 * 1024 * 1024;

    const imageUrls: string[] = [];
    const filenames: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return apiResponse.error(
          "Invalid file type in one of the uploads",
          400,
        );
      }
      if (file.size > MAX_SIZE) {
        return apiResponse.error("One of the files is too large", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, buffer, { contentType: file.type, upsert: false });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);
      imageUrls.push(publicUrl);
      filenames.push(fileName);
    }

    return apiResponse.success({ imageUrls, filenames });
  } catch (error) {
    console.error("Multiple upload error:", error);
    return apiResponse.error("Failed to upload images");
  }
}
