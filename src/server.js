// Loads .env, connects MongoDB, starts HTTP and handles graceful shutdown.

require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");

let server;

async function startServer() {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`API documentation: http://localhost:${env.PORT}/api/v1/docs`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  shutdown("unhandledRejection");
});

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});