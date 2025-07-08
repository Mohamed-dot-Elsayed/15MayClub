import { z } from "zod";

export const createComplaintSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    content: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
  }),
});
