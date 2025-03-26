export default {
  // Bun-specific optimizations
  runtime: "bun",

  // Enable HTTP/2
  http2: true,

  // Set environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },

  // Configure server
  server: {
    port: process.env.PORT || 3000,
    hostname: process.env.HOST || "localhost",
  },

  // Configure plugins
  plugins: [],
}

