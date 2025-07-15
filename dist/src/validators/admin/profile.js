"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phoneNumber: zod_1.z.string().optional(),
        email: zod_1.z.string().email("invalid email").optional(),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .optional(),
    }),
});
