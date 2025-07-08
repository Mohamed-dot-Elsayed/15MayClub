import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "name must be at least 3 characters long"),
      phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/, {
        message: "Invalid Egyptian phone number",
      }),
      role: z.enum(["member", "guest"]),
      email: z.string().email("Invalid email"),
      password: z
        .string()
        .refine(
          (val) =>
            !val ||
            (val.length >= 8 &&
              /[A-Z]/.test(val) &&
              /[a-z]/.test(val) &&
              /[0-9]/.test(val)),
          {
            message:
              "Password must be at least 8 characters and include upper, lower, and number",
          }
        ),
      dateOfBirth: z
        .string()
        .refine(
          (val) => {
            const date = new Date(val);
            const today = new Date();
            return !isNaN(date.getTime()) && date < today;
          },
          {
            message: "Date of birth must be a valid past date",
          }
        )
        .refine(
          (val) => {
            const dob = new Date(val);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            return age >= 10 && age <= 120;
          },
          {
            message: "Age must be between 10 and 120 years",
          }
        ),
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
    password: z.string().min(6),
  }),
});
