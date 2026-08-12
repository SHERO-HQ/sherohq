import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import bcrypt from "bcryptjs";
import { PasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  password: PasswordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) {
      return apiResponse.unauthorized();
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return apiResponse.error("Invalid request body", 400);
    }

    const validated = ChangePasswordSchema.safeParse(body);
    if (!validated.success) {
      return apiResponse.validationError(validated.error);
    }

    const { currentPassword, password: newPassword } = validated.data;

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, sessionUser.id),
      columns: { passwordHash: true },
    });

    if (!userRecord || !userRecord.passwordHash) {
      return apiResponse.error("User account not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.passwordHash);
    if (!isMatch) {
      return apiResponse.error("Current password is incorrect", 400);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ passwordHash: newHashedPassword })
      .where(eq(users.id, sessionUser.id));

    return apiResponse.success({
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return apiResponse.error("Failed to change password", 500);
  }
}
