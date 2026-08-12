import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { uploadFilesToStorage } from "@/lib/storage";

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

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return apiResponse.error(
          "Invalid file type in one of the uploads",
          400
        );
      }
      if (file.size > MAX_SIZE) {
        return apiResponse.error("One of the files is too large", 400);
      }
    }

    const { imageUrls, filenames } = await uploadFilesToStorage(files, {
      bucket: "products",
    });

    return apiResponse.success({ imageUrls, filenames });
  } catch (error: any) {
    console.error("Multiple upload error:", error);
    return apiResponse.error(error?.message || "Failed to upload images");
  }
}

