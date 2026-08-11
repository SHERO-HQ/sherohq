import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { jobApplications, careers } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendApplicationReceivedEmail, sendNewApplicationAdminEmail } from "@/lib/notifications/services/careers";

export async function POST(request: NextRequest) {
  try {
    const { jobId, applicantName, applicantEmail, applicantPhone, resumeUrl, portfolioUrl, coverLetter } = await request.json();
    
    if (!jobId || !applicantName || !applicantEmail) {
      return apiResponse.error("Job ID, name, and email are required", 400);
    }

    const id = uuidv4();
    await db.insert(jobApplications).values({
      id,
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone: applicantPhone || null,
      resumeUrl: resumeUrl || null,
      portfolioUrl: portfolioUrl || null,
      coverLetter: coverLetter || null,
    });

    // Fetch Job Title
    const jobResult = await db.select({ title: careers.title }).from(careers).where(eq(careers.id, jobId)).limit(1);
    const jobTitle = jobResult[0]?.title || "Open Position";

    // Send notifications in the background
    Promise.all([
      sendApplicationReceivedEmail(applicantEmail, applicantName, jobTitle),
      sendNewApplicationAdminEmail(jobTitle, applicantName, applicantEmail)
    ]).catch((err) => console.error("Error sending application emails:", err));

    return apiResponse.success({ success: true, id }, 201);
  } catch (error) {
    console.error("Submit application error:", error);
    return apiResponse.error("Failed to submit application", 500);
  }
}
