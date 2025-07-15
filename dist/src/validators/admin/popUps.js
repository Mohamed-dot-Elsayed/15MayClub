"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePopUpSchema = exports.createPopUpSchema = void 0;
// validations/popups.ts
const zod_1 = require("zod");
exports.createPopUpSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        imagePath: zod_1.z.string(), // support base64 or URL
        startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid startDate",
        }), // YYYY-MM-DD
        endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid startDate",
        }), // YYYY-MM-DD
        status: zod_1.z.enum(["active", "disabled"]).optional(),
        pageIds: zod_1.z.array(zod_1.z.string()).min(1),
    }),
});
exports.updatePopUpSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        imagePath: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        status: zod_1.z.enum(["active", "disabled"]).optional(),
        pageIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    }),
});
