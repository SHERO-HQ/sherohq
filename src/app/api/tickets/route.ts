import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromSession, getAdminFromSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { notificationService } from "@/lib/notifications";

// Schema-like check for POST payload validation
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
      return NextResponse.json(
        { error: "Missing required fields (name, email, subject, message, category)" },
        { status: 400 }
      );
    }

    const ticketId = uuidv4();
    
    // Retrieve next ticket number safely
    const numResult = await query("SELECT COALESCE(MAX(ticket_no), 1000) + 1 AS next_no FROM tickets");
    const nextTicketNo = numResult.rows[0]?.next_no || 1001;

    // Resolve userId from session if not explicitly provided
    let finalUserId = body.userId || null;
    if (!finalUserId) {
      const user = await getUserFromSession();
      if (user) {
        finalUserId = user.id;
      }
    }

    await query(
      `INSERT INTO tickets (
        id,
        ticket_no,
        name,
        email,
        phone,
        subject,
        message,
        category,
        priority,
        status,
        "productId",
        "userId",
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        ticketId,
        nextTicketNo,
        body.name,
        body.email,
        body.phone || null,
        body.subject,
        body.message,
        body.category,
        body.priority || "medium",
        "open",
        body.productId || null,
        finalUserId,
      ]
    );

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
      createdAt: new Date().toISOString(),
    };

    try {
      await Promise.all([
        notificationService.sendSupportTicketCreatedEmail(ticketObj),
        notificationService.sendNewSupportTicketAdminAlert(ticketObj),
      ]);
    } catch (emailErr) {
      console.error("Failed to send ticket creation notifications:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Ticket submitted successfully",
      ticketId,
      ticketNo: nextTicketNo,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
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
      const result = await query('SELECT * FROM tickets ORDER BY "createdAt" DESC');
      return NextResponse.json(result.rows);
    }

    if (user) {
      // Logged in users can see their own tickets
      const result = await query(
        `SELECT * FROM tickets WHERE "userId" = $1 OR email = $2 ORDER BY "createdAt" DESC`,
        [user.id, user.email]
      );
      return NextResponse.json(result.rows);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
