import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  shippingAddress: z.any().nullable().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return apiResponse.unauthorized();
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return apiResponse.error("Invalid request body", 400);
    }

    const validated = UpdateProfileSchema.safeParse(body);
    if (!validated.success) {
      return apiResponse.validationError(validated.error);
    }

    const updateData: Record<string, any> = {};
    if (validated.data.name !== undefined) updateData.name = validated.data.name;
    if (validated.data.phone !== undefined) updateData.phone = validated.data.phone;
    if (validated.data.shippingAddress !== undefined) {
      updateData.shippingAddress = validated.data.shippingAddress;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
    }

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        phone: true,
        emailVerified: true,
        mfaEnabled: true,
        shippingAddress: true,
        createdAt: true,
      },
    });

    return apiResponse.success({
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return apiResponse.error("Failed to update profile", 500);
  }
}
