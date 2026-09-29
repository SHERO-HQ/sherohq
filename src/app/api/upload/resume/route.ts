import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { uploadFileToStorage } from "@/lib/storage";
import { validateResumeFile } from "@/lib/upload-validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`resume_upload_${ip}`, 5, 60 * 60_000);
    if (!limiter.success) {
      return apiResponse.error("Too many uploads. Please try again later.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return apiResponse.error("No resume file provided", 400);
    }

    const validation = validateResumeFile(file);
    if (!validation.ok) {
      return apiResponse.error(validation.error, 400);
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
