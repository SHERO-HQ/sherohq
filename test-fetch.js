const start = Date.now();
console.log("Testing fetch to http://localhost:5173/api/health...");

fetch("http://localhost:5173/api/health")
  .then((res) => res.json())
  .then((data) => {
    console.log("Success:", data);
    console.log("Time:", Date.now() - start, "ms");
  })
  .catch((err) => {
    console.error("Fetch Error:", err);
    console.error("Cause:", err.cause);
  });
