import { z } from "zod";

export const createFullVoteSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    maxSelections: z.number().min(1),
    items: z.array(z.string().min(1)).optional(),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

export const updateVoteSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    maxSelections: z.number().min(1).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const flexibleVoteItemsSchema = z.object({
  body: z.object({
    items: z.array(
      z
        .object({
          id: z.string().uuid().optional(),
          value: z.string().min(1).optional(),
        })
        .refine((item) => item.id || item.value, {
          message: "Each item must have at least 'id' or 'value'",
        })
    ),
  }),
});
