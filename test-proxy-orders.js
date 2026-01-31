async function test() {
  try {
    const res = await fetch("http://localhost:5173/api/orders", {
      headers: { Accept: "application/json" },
    });
    console.log("Status:", res.status);
    console.log("OK:", res.ok);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Body length:", text.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
