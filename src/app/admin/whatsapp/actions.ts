"use server";

export async function getWhatsAppConfigStatus() {
  return {
    hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
}

export async function getWhatsAppAnalytics(days: number = 14) {
  const { query } = await import("@/lib/db");
  const admin = await import("@/lib/auth").then(m => m.getAdminFromSession());
  if (!admin) throw new Error("Unauthorized");

  // Fetch aggregated daily volume
  const result = await query(
    `
    WITH dates AS (
      SELECT generate_series(
        CURRENT_DATE - ($1 || ' days')::interval + INTERVAL '1 day',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS date
    )
    SELECT 
      TO_CHAR(d.date, 'Mon DD') as date,
      COUNT(m.id) FILTER (WHERE m.direction = 'inbound') as inbound,
      COUNT(m.id) FILTER (WHERE m.direction = 'outbound') as outbound
    FROM dates d
    LEFT JOIN whatsapp_messages m 
      ON DATE(m.created_at) = d.date 
    GROUP BY d.date
    ORDER BY d.date ASC;
    `,
    [days]
  );

  // Fetch total counts for summary cards (for the given time period)
  const totalsResult = await query(
    `
    SELECT 
      COUNT(*) FILTER (WHERE direction = 'inbound') as total_inbound,
      COUNT(*) FILTER (WHERE direction = 'outbound') as total_outbound,
      COUNT(*) FILTER (WHERE direction = 'outbound' AND status = 'failed') as failed_outbound
    FROM whatsapp_messages
    WHERE created_at >= CURRENT_DATE - ($1 || ' days')::interval + INTERVAL '1 day'
    `,
    [days]
  );

  const totals = totalsResult.rows[0];

  return {
    dailyData: result.rows.map(r => ({
      date: r.date,
      inbound: parseInt(r.inbound) || 0,
      outbound: parseInt(r.outbound) || 0,
    })),
    totals: {
      inbound: parseInt(totals.total_inbound) || 0,
      outbound: parseInt(totals.total_outbound) || 0,
      failedOutbound: parseInt(totals.failed_outbound) || 0,
    }
  };
}
