import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(5),
  }),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(5).optional(),
    })
    .refine(
      (data) => {
        return data.name === undefined || data.name.length >= 5;
      },
      {
        message: "Name must be at least 5 characters long",
      }
    ),
});
