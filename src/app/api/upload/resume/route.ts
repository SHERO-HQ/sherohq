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
      .from("products") // Re-using products bucket since we know it exists
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      resumeUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}
