const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    record: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, record: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

favoriteSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Favorite", favoriteSchema);
