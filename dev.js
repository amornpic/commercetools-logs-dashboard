import { spawn } from "bun"

// Start Next.js dev server
const nextDev = spawn(["next", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  env: {
    ...process.env,
    NEXT_RUNTIME: "edge",
  },
})

console.log("Next.js dev server started with Bun runtime")

// Handle process termination
process.on("SIGINT", () => {
  nextDev.kill()
  process.exit(0)
})

