// Validates and exports environment configuration.

const { z } = require("zod");

const nodeEnv = process.env.NODE_ENV || "development";
const developmentSecret = "development-only-secret-change-me-123456";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/search_api"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse({
  ...process.env,
  NODE_ENV: nodeEnv,
  JWT_SECRET:
    process.env.JWT_SECRET || (nodeEnv === "production" ? undefined : developmentSecret),
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

module.exports = parsed.data;