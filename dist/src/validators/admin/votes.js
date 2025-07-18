"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoteSchema = exports.createFullVoteSchema = void 0;
const zod_1 = require("zod");
exports.createFullVoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        maxSelections: zod_1.z.number().min(1),
        items: zod_1.z.array(zod_1.z.string().min(1)).optional(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
    }),
});
exports.updateVoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        maxSelections: zod_1.z.number().min(1).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    }),
});
