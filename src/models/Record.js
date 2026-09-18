// Defines searchable records, constraints, references and indexes.

const mongoose = require("mongoose");
const slugify = require("slugify");

const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "technology",
        "education",
        "health",
        "finance",
        "travel",
        "business",
        "entertainment",
        "other",
      ],
      lowercase: true,
      index: true,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true,
    },
    location: {
      city: { type: String, trim: true, lowercase: true },
      country: { type: String, trim: true, lowercase: true },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

recordSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 }, name: "record_text_search" }
);
recordSchema.index({ status: 1, category: 1, createdAt: -1 });
recordSchema.index({ status: 1, price: 1, rating: -1 });

recordSchema.pre("validate", function assignSlug() {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

recordSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Record", recordSchema);