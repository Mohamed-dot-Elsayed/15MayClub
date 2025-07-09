"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string(),
        content: zod_1.z
            .string()
            .min(10, "Description must be at least 10 characters long"),
    }),
});
