import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { uploadFileToStorage } from "@/lib/storage";

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

    const result = await uploadFileToStorage(file, {
      bucket: "products",
    });

    return apiResponse.success({
      success: true,
      imageUrl: result.publicUrl,
    });
  } catch (error: any) {
    console.error("Public upload error:", error);
    return apiResponse.error(error?.message || "Failed to upload image", 500);
  }
}
