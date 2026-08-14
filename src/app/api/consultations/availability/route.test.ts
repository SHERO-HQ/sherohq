import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: vi.fn().mockResolvedValue([
          { time: "10:00 AM" },
          { time: "02:00 PM" },
        ]),
      }),
    }),
  },
}));

describe("GET /api/consultations/availability", () => {
  it("returns 400 if date parameter is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/consultations/availability");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Date parameter is required");
  });

  it("returns booked times for a valid date", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/consultations/availability?date=2026-08-20",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.bookedTimes).toEqual(["10:00 AM", "02:00 PM"]);
  });
});
