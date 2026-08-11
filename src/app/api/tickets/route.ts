import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/drizzle/schema";
import { eq, or, desc, sql } from "drizzle-orm";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { notificationService } from "@/lib/notifications";

interface CreateTicketBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority?: string;
  productId?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTicketBody;

    // Simple validation
    if (!body.name || !body.email || !body.subject || !body.message || !body.category) {
      return apiResponse.error("Missing required fields (name, email, subject, message, category)", 400);
    }

    const ticketId = uuidv4();
    
    // Retrieve next ticket number safely
    const numResult = await db.select({ next_no: sql<number>`COALESCE(MAX(ticket_no), 1000) + 1` }).from(tickets);
    const nextTicketNo = numResult[0]?.next_no || 1001;

    // Resolve userId from session if not explicitly provided
    let finalUserId = body.userId || null;
    if (!finalUserId) {
      const user = await getUserFromSession();
      if (user) {
        finalUserId = user.id;
      }
    }

    await db.insert(tickets).values({
      id: ticketId,
      ticketNo: nextTicketNo,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject,
      message: body.message,
      category: body.category,
      priority: body.priority || "medium",
      status: "open",
      productId: body.productId || null,
      userId: finalUserId,
      createdAt: new Date().toISOString(),
    });

    const ticketObj = {
      id: ticketId,
      ticket_no: nextTicketNo,
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      category: body.category,
      priority: body.priority || "medium",
      status: "open",
      createdAt: new Date().toISOString()
    };

    try {
      await Promise.all([
        notificationService.sendSupportTicketCreatedEmail(ticketObj as any),
        notificationService.sendNewSupportTicketAdminAlert(ticketObj as any),
      ]);
    } catch (emailErr) {
      console.error("Failed to send ticket creation notifications:", emailErr);
    }

    return apiResponse.success({
      success: true,
      message: "Ticket submitted successfully",
      ticketId,
      ticketNo: nextTicketNo
    }, 201);
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return apiResponse.error("Failed to create support ticket", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const [admin, user] = await Promise.all([
      getAdminFromSession(),
      getUserFromSession(),
    ]);

    if (admin) {
      // Admins can see all tickets
      const result = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
      return apiResponse.success(result);
    }

    if (user) {
      // Logged in users can see their own tickets
      const result = await db.select()
        .from(tickets)
        .where(or(eq(tickets.userId, user.id), eq(tickets.email, user.email)))
        .orderBy(desc(tickets.createdAt));
      return apiResponse.success(result);
    }

    return apiResponse.unauthorized();
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return apiResponse.error("Failed to fetch tickets", 500);
  }
}
