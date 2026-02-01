require('dotenv').config({path: 'server/.env'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const days = 7;
    const ordersResult = await pool.query(`
      SELECT "createdAt", total 
      FROM orders 
      WHERE status != 'cancelled' 
      AND "createdAt" >= NOW() - INTERVAL '${days} days'
      ORDER BY "createdAt" ASC
    `);
    
    console.log('Total orders in range:', ordersResult.rows.length);
    
    const groupedData = {};
    for (let i = -1; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      groupedData[dateStr] = { revenue: 0, orders: 0 };
    }
    
    ordersResult.rows.forEach(order => {
      const dateStr = new Date(order.createdAt).toISOString().split("T")[0];
      if (groupedData[dateStr]) {
        groupedData[dateStr].revenue += parseFloat(order.total);
        groupedData[dateStr].orders += 1;
      } else {
        console.warn('Order date not in initialized range:', dateStr);
      }
    });
    
    console.log('Analytics Data (last 3 entries):');
    Object.entries(groupedData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-3)
      .forEach(([date, data]) => {
        console.log(`${date}: ${data.orders} orders, GH₵${data.revenue}`);
      });

  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
main();
