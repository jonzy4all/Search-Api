// Validates registration, login and password strength.

const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().transform((value) => value.toLowerCase()),
      password: passwordSchema,
      passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
      message: "Passwords do not match",
    }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: passwordSchema,
      newPasswordConfirm: z.string(),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
      path: ["newPasswordConfirm"],
      message: "New passwords do not match",
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      path: ["newPassword"],
      message: "New password must be different from the current password",
    }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  passwordSchema,
};
