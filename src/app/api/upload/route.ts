import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { validateUploadedFile } from "@/lib/upload-validation";
import { uploadFileToStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
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

    const result = await uploadFileToStorage(file, {
      bucket: "products",
      folder: "uploads",
    });

    return apiResponse.success({
      imageUrl: result.publicUrl,
      filename: result.filename,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return apiResponse.error(error?.message || "Failed to upload image");
  }
}

