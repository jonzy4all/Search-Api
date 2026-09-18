// Defines users, roles, password hashing, and password confirmation.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    // confirmPassword: {
    //   type: String,
    //   required: [true, "Please confirm your password"],
    //   minlength: 8,
    //   select: false,
    //   validate: {
    //     validator: function (value) {
    //       return value === this.password;
    //     },
    //     message: "Passwords do not match",
    //   },
    // },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(
    this.password,
    12
  );

  if (!this.isNew) {
    // Subtract one second so a token issued immediately after the save is valid.
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Returns true when the password was changed after a JWT was issued.
userSchema.methods.changedPasswordAfter = function changedPasswordAfter(
  jwtIssuedAt
) {
  if (!this.passwordChangedAt) return false;
  return this.passwordChangedAt.getTime() / 1000 > jwtIssuedAt;
};

// Remove sensitive fields from JSON responses
userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.passwordChangedAt;
    // delete ret.confirmPassword;
    delete ret.__v;

    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
