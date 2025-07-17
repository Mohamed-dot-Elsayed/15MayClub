"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const zod_1 = require("zod");
// export const updateUserSchema = z.object({
//   body: signupSchema.partial().optional(),
// });
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 3, {
            message: "Name must be at least 2 characters",
        }),
        email: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: "Invalid email address",
        }),
        phoneNumber: zod_1.z.string().optional(),
        role: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || ["member", "guest"].includes(val), {
            message: "Role must be one of: admin, member, guest",
        }),
        password: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 8, {
            message: "Password must be at least 8 characters and include upper, lower, and number",
        }),
        imageBase64: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "Date of birth must be a valid date string",
        }),
    })
        .superRefine((data, ctx) => {
        if (data.imageBase64 && !data.imageBase64.startsWith("data:image/")) {
            ctx.addIssue({
                path: ["imageBase64"],
                code: zod_1.z.ZodIssueCode.custom,
                message: "Valid base64 image is required",
            });
        }
    }),
});
