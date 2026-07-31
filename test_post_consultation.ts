import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const payload = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    service: "it-support",
    date: "2026-08-01",
    time: "10:00 AM",
    message: "Test message"
  };

  try {
    const res = await fetch("http://localhost:3000/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error executing fetch:", err);
  }
}

run();
