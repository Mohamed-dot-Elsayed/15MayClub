// validations/popups.ts
import { z } from "zod";

export const createPopUpSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    imagePath: z.string(), // support base64 or URL
    startDate: z.date(), // YYYY-MM-DD
    endDate: z.date(), // YYYY-MM-DD
    status: z.enum(["active", "disabled"]).optional(),
    pageIds: z.array(z.string()).min(1),
  }),
});

export const updatePopUpSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    imagePath: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    pageIds: z.array(z.string().uuid()).optional(),
  }),
});
