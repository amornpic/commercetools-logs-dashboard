import { spawn } from "bun"

// Start Next.js production server
const nextStart = spawn(["next", "start"], {
  stdout: "inherit",
  stderr: "inherit",
  env: {
    ...process.env,
    NEXT_RUNTIME: "edge",
  },
})

console.log("Next.js production server started with Bun runtime")

// Handle process termination
process.on("SIGINT", () => {
  nextStart.kill()
  process.exit(0)
})

