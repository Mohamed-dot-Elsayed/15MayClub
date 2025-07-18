import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "name must be at least 2 characters long"),
      phoneNumber: z.string(),
      role: z.enum(["member", "guest"]),
      email: z.string().email("Invalid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      dateOfBirth: z.string(),
      purpose: z.string().optional(),
      imageBase64: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "guest") {
        if (!data.purpose || data.purpose.trim() === "") {
          ctx.addIssue({
            path: ["purpose"],
            code: z.ZodIssueCode.custom,
            message: "Purpose is required for guest users",
          });
        }
      }

      if (data.role === "member") {
        if (!data.imageBase64 || !data.imageBase64.startsWith("data:image/")) {
          ctx.addIssue({
            path: ["imageBase64"],
            code: z.ZodIssueCode.custom,
            message: "Valid base64 image is required for member users",
          });
        }
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.string(),
    code: z.string().length(6, "Verification code must be 6 characters long"),
  }),
});

export const sendResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
  }),
});

export const checkResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Reset code must be 6 characters long"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Reset code must be 6 characters long"),
    newPassword: z.string().min(8),
  }),
});
