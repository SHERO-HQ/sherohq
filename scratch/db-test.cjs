const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: 'trustcircle-realib1.i.aivencloud.com', 
     user: 'avnadmin', 
     password: 'AVNS_vztbIoRkRVeUu5Rp6-S',
     database: 'defaultdb',
     port: 15378,
     ssl: { rejectUnauthorized: false },
     connectTimeout: 5000
});

async function test() {
    let conn;
    try {
        console.log("Attempting to connect...");
        conn = await pool.getConnection();
        console.log("Successfully connected!");
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}
test();
