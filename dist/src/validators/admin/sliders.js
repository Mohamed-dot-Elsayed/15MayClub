"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSliderSchema = exports.createSliderSchema = void 0;
// validations/slider.ts
const zod_1 = require("zod");
exports.createSliderSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        status: zod_1.z.enum(["active", "disabled"]).optional(),
        order: zod_1.z.number().int(),
        images: zod_1.z.array(zod_1.z.string().min(1)), // base64 or imagePath strings
    }),
});
exports.updateSliderSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        status: zod_1.z.enum(["active", "disabled"]).optional(),
        order: zod_1.z.number().int().optional(),
        images: zod_1.z.array(zod_1.z.any()).optional(),
    }),
});
