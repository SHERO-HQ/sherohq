import { sendEmail, wrapEmailHtml } from "../core/email";
import { COMPANY_EMAILS } from "@/constants/emails";

export async function sendApplicationReceivedEmail(applicantEmail: string, applicantName: string, jobTitle: string) {
  const htmlContent = wrapEmailHtml(`
    <h2 style="color: #333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Application Received</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hi ${applicantName},
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Thank you for applying for the <strong>${jobTitle}</strong> position at SHERO TECHNOLOGIES! 
      We have successfully received your application.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Our team is currently reviewing applications and will get back to you soon regarding the next steps in the process.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Best regards,<br>
      The SHERO Team
    </p>
  `);

  await sendEmail(applicantEmail, `Application Received: ${jobTitle}`, htmlContent);
}

export async function sendNewApplicationAdminEmail(jobTitle: string, applicantName: string, applicantEmail: string) {
  const adminEmail = COMPANY_EMAILS.CAREERS || COMPANY_EMAILS.SUPPORT;
  
  const htmlContent = wrapEmailHtml(`
    <h2 style="color: #333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">New Job Application</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      A new application has been submitted for the <strong>${jobTitle}</strong> position.
    </p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0;"><strong>Applicant:</strong> ${applicantName}</p>
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${applicantEmail}</p>
    </div>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Please log in to the admin dashboard to review the full application, including the resume and cover letter.
    </p>
  `);

  await sendEmail(adminEmail, `🚨 New Application: ${jobTitle} - ${applicantName}`, htmlContent);
}

export async function sendApplicationStatusEmail(applicantEmail: string, applicantName: string, jobTitle: string, status: string) {
  if (status !== "accepted" && status !== "rejected") return;

  const isAccepted = status === "accepted";
  const subject = isAccepted ? `Update on your application: ${jobTitle}` : `Update on your application: ${jobTitle}`;
  
  const bodyContent = isAccepted 
    ? `We've reviewed your application for the <strong>${jobTitle}</strong> role and we'd love to move forward! Our team will be reaching out shortly to schedule an interview.`
    : `Thank you for taking the time to apply for the <strong>${jobTitle}</strong> role. While we were impressed with your background, we have decided to move forward with other candidates who more closely fit our current needs. We wish you the best of luck in your job search!`;

  const htmlContent = wrapEmailHtml(`
    <h2 style="color: #333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Application Update</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hi ${applicantName},
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      ${bodyContent}
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Best regards,<br>
      The SHERO Team
    </p>
  `);

  await sendEmail(applicantEmail, subject, htmlContent);
}
