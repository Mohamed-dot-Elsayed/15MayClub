"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.sendResetCodeSchema = exports.verifyEmailSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(3, "name must be at least 3 characters long"),
        phoneNumber: zod_1.z.string().regex(/^01[0125][0-9]{8}$/, {
            message: "Invalid Egyptian phone number",
        }),
        role: zod_1.z.enum(["member", "guest"]),
        email: zod_1.z.string().email("Invalid email"),
        password: zod_1.z
            .string()
            .refine((val) => !val ||
            (val.length >= 8 &&
                /[A-Z]/.test(val) &&
                /[a-z]/.test(val) &&
                /[0-9]/.test(val)), {
            message: "Password must be at least 8 characters and include upper, lower, and number",
        }),
        dateOfBirth: zod_1.z
            .string()
            .refine((val) => {
            const date = new Date(val);
            const today = new Date();
            return !isNaN(date.getTime()) && date < today;
        }, {
            message: "Date of birth must be a valid past date",
        })
            .refine((val) => {
            const dob = new Date(val);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            return age >= 10 && age <= 120;
        }, {
            message: "Age must be between 10 and 120 years",
        }),
        purpose: zod_1.z.string().optional(),
        imageBase64: zod_1.z.string().optional(),
    })
        .superRefine((data, ctx) => {
        if (data.role === "guest") {
            if (!data.purpose || data.purpose.trim() === "") {
                ctx.addIssue({
                    path: ["purpose"],
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Purpose is required for guest users",
                });
            }
        }
        if (data.role === "member") {
            if (!data.imageBase64 || !data.imageBase64.startsWith("data:image/")) {
                ctx.addIssue({
                    path: ["imageBase64"],
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Valid base64 image is required for member users",
                });
            }
        }
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string(),
        code: zod_1.z.string().length(6, "Verification code must be 6 characters long"),
    }),
});
exports.sendResetCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
        code: zod_1.z.string().length(6, "Reset code must be 6 characters long"),
        newPassword: zod_1.z
            .string()
            .refine((val) => !val ||
            (val.length >= 8 &&
                /[A-Z]/.test(val) &&
                /[a-z]/.test(val) &&
                /[0-9]/.test(val)), {
            message: "New password must be at least 8 characters and include upper, lower, and number",
        }),
    }),
});
