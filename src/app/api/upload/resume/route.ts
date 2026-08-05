import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
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
      return NextResponse.json({ error: error.message || "Failed to upload resume to storage" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resumeUrl: fileName, // Store the raw path instead of a public URL
    });
  } catch (error: any) {
    console.error("Resume upload exception:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload resume" }, { status: 500 });
  }
}
