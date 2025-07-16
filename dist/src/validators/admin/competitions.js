"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserSchema = exports.updateCompetitionSchema = exports.createCompetitionSchema = void 0;
const zod_1 = require("zod");
// Base image validation (base64 string)
const base64Image = zod_1.z
    .string()
    .min(1, "Image is required")
    .refine((val) => val.startsWith("data:image/"), {
    message: "Invalid base64 image format",
});
// Create Competition
exports.createCompetitionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().min(1),
        mainImagepath: base64Image,
        startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid startDate",
        }),
        endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid endDate",
        }),
        images: zod_1.z.array(base64Image).optional(),
    }),
});
// Update Competition (partial allows optional fields)
exports.updateCompetitionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(1).optional(),
        mainImagepath: base64Image.optional(),
        startDate: zod_1.z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid startDate",
        })
            .optional(),
        endDate: zod_1.z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid endDate",
        })
            .optional(),
        images: zod_1.z.array(zod_1.z.any()).optional(),
    }),
});
// Remove user from competition
exports.removeUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
    }),
});
