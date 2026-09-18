// Creates the administrator and sample search records.

require("dotenv").config();

const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const Record = require("../src/models/Record");

const samples = [
  {
    title: "Node.js Backend Engineering",
    slug: "nodejs-backend-engineering",
    description: "A practical backend engineering record covering Express, REST APIs, validation and security.",
    category: "technology",
    tags: ["nodejs", "express", "api"],
    status: "published",
    price: 25000,
    rating: 4.8,
    location: { city: "lagos", country: "nigeria" },
  },
  {
    title: "Personal Finance Fundamentals",
    slug: "personal-finance-fundamentals",
    description: "An accessible introduction to budgeting, saving, emergency funds and responsible investing.",
    category: "finance",
    tags: ["money", "budget", "saving"],
    status: "published",
    price: 15000,
    rating: 4.5,
    location: { city: "abuja", country: "nigeria" },
  },
  {
    title: "Modern API Security Checklist",
    slug: "modern-api-security-checklist",
    description: "A draft checklist for authentication, authorization, rate limiting, validation and safe error handling.",
    category: "technology",
    tags: ["security", "api", "jwt"],
    status: "draft",
    price: 0,
    rating: 0,
    location: { city: "eindhoven", country: "netherlands" },
  },
];

async function seed() {
  await connectDatabase();

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  let admin = await User.findOne({ email }).select("+password");

  if (!admin) {
    if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is required when seeding in production");
    }
    admin = await User.create({
      name: process.env.ADMIN_NAME || "Search API Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
      role: "admin",
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  for (const sample of samples) {
    await Record.findOneAndUpdate(
      { slug: sample.slug },
      { ...sample, createdBy: admin._id },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seed complete. Admin email: ${email}; records: ${samples.length}`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await disconnectDatabase();
  process.exit(1);
});
