import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { jobId, applicantName, applicantEmail, applicantPhone, resumeUrl, coverLetter } = await request.json();
    
    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json({ error: "Job ID, name, and email are required" }, { status: 400 });
    }

    const id = uuidv4();
    await query(
      `INSERT INTO job_applications (id, "jobId", "applicantName", "applicantEmail", "applicantPhone", "resumeUrl", "coverLetter")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, applicantName, applicantEmail, applicantPhone || null, resumeUrl || null, coverLetter || null]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
