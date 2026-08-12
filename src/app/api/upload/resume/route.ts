import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { uploadFileToStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return apiResponse.error("No resume file provided", 400);
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return apiResponse.error("File too large (max 5MB)", 400);
    }

    const result = await uploadFileToStorage(file, {
      bucket: "resumes",
      folder: "resumes",
    });

    return apiResponse.success({
      success: true,
      resumeUrl: result.storageType === "local" ? result.publicUrl : `resumes/${result.filename}`,
    });
  } catch (error: any) {
    console.error("Resume upload exception:", error);
    return apiResponse.error(error?.message || "Failed to upload resume", 500);
  }
}
