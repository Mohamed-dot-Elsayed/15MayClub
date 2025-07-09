"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(5),
        description: zod_1.z.string().min(10),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(5).optional(),
        description: zod_1.z.string().min(10).optional(),
    })
        .refine((data) => {
        return ((data.name === undefined || data.name.length >= 5) &&
            (data.description === undefined || data.description.length >= 10));
    }, {
        message: "Name must be at least 5 characters long",
    }),
});
