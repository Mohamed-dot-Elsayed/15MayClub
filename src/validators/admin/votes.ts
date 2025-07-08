import { z } from "zod";

export const createFullVoteSchema = z
  .object({
    body: z.object({
      name: z.string().min(3),
      maxSelections: z.number().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
  })
  .refine(({ body }) => body.maxSelections <= body.items.length, {
    message: "maxSelections must be less than or equal to number of items",
    path: ["body", "maxSelections"],
  });

export const updateVoteSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    maxSelections: z.number().min(1).optional(),
  }),
});
