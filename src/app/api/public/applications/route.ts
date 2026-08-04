import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendApplicationReceivedEmail, sendNewApplicationAdminEmail } from "@/lib/notifications/services/careers";

export async function POST(request: NextRequest) {
  try {
    const { jobId, applicantName, applicantEmail, applicantPhone, resumeUrl, portfolioUrl, coverLetter } = await request.json();
    
    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json({ error: "Job ID, name, and email are required" }, { status: 400 });
    }

    const id = uuidv4();
    await query(
      `INSERT INTO job_applications (id, "jobId", "applicantName", "applicantEmail", "applicantPhone", "resumeUrl", "portfolioUrl", "coverLetter")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, jobId, applicantName, applicantEmail, applicantPhone || null, resumeUrl || null, portfolioUrl || null, coverLetter || null]
    );

    // Fetch Job Title
    const jobResult = await query(`SELECT title FROM careers WHERE id = $1`, [jobId]);
    const jobTitle = jobResult.rows[0]?.title || "Open Position";

    // Send notifications in the background
    Promise.all([
      sendApplicationReceivedEmail(applicantEmail, applicantName, jobTitle),
      sendNewApplicationAdminEmail(jobTitle, applicantName, applicantEmail)
    ]).catch((err) => console.error("Error sending application emails:", err));

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
