import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    
    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    let filePath = path;
    
    // Backwards compatibility for old records that stored the full public HTTP URL
    if (path.startsWith("http")) {
      try {
        const urlObj = new URL(path);
        // Extract the path after /public/resumes/
        const match = urlObj.pathname.match(/\/public\/resumes\/(.+)$/);
        if (match && match[1]) {
          // Inside the resumes bucket, the path we used was `resumes/...`
          filePath = `resumes/${match[1]}`;
        } else {
          // If it doesn't match our storage pattern, fallback to redirecting
          return NextResponse.redirect(path);
        }
      } catch (e) {
        return NextResponse.redirect(path);
      }
    }

    // In the upload route, we upload to `from("resumes").upload("resumes/UUID.ext")`.
    // Wait, actually, let's verify if `filePath` has `resumes/` prefix. 
    // If it does, we strip it out if the bucket is "resumes"? 
    // In Supabase, if the bucket is "resumes", and we uploaded to "resumes/...", 
    // the object path is "resumes/...". So we just pass filePath.
    
    // Generate a 60-second signed URL
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(filePath, 60);

    if (error || !data) {
      console.error("Failed to create signed URL:", error);
      // Fallback: if we can't sign it, perhaps it's an invalid path or still public. 
      // We can just error out.
      return NextResponse.json({ error: "Failed to generate secure URL" }, { status: 500 });
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Resume secure download error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
