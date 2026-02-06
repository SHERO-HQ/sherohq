import { flushAllData } from "./seed";

async function runFlush() {
  try {
    await flushAllData();
    console.log("🚀 Flush script executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("💥 Flush script failed:", error);
    process.exit(1);
  }
}

runFlush();
