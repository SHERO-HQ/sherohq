import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `resumes/${uuidv4()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("resumes") // Attempt to use resumes bucket
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return apiResponse.error(error.message || "Failed to upload resume to storage", 500);
    }

    return apiResponse.success({
      success: true,
      resumeUrl: fileName, // Store the raw path instead of a public URL
    });
  } catch (error: any) {
    console.error("Resume upload exception:", error);
    return apiResponse.error(error?.message || "Failed to upload resume", 500);
  }
}
