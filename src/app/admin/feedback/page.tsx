import React from "react";
import { query as dbQuery } from "../../../lib/db";

export default async function Page() {
  if (!process.env.DATABASE_URL) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Feedback admin</h2>
        <p>No DATABASE_URL configured — feedback is not persisted.</p>
      </div>
    );
  }

  let rows = [] as Array<any>;
  try {
    const res = await dbQuery(
      `SELECT id, name, email, rating, message, created_at FROM customer_feedback ORDER BY created_at DESC LIMIT 200`,
    );
    rows = res?.rows || [];
  } catch (err) {
    console.error("[Admin feedback] DB query failed:", err);
    return (
      <div style={{ padding: 24 }}>
        <h2>Feedback admin</h2>
        <p>Failed to load feedback (see server logs).</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Customer Feedback</h2>
      <p>Showing recent feedback (max 200).</p>
      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>When</th>
              <th style={{ textAlign: "left", padding: 8 }}>Submitter</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", padding: 8 }}>Rating</th>
              <th style={{ textAlign: "left", padding: 8 }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                <td
                  style={{
                    padding: 8,
                    verticalAlign: "top",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td style={{ padding: 8, verticalAlign: "top" }}>
                  {r.name || "Anonymous"}
                </td>
                <td style={{ padding: 8, verticalAlign: "top" }}>
                  {r.email || "—"}
                </td>
                <td style={{ padding: 8, verticalAlign: "top" }}>
                  {r.rating || "—"}
                </td>
                <td style={{ padding: 8, verticalAlign: "top", maxWidth: 600 }}>
                  {r.message}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 12 }}>
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
