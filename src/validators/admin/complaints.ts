import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(5),
    description: z.string().min(10),
  }),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(5).optional(),
      description: z.string().min(10).optional(),
    })
    .refine(
      (data) => {
        return (
          (data.name === undefined || data.name.length >= 5) &&
          (data.description === undefined || data.description.length >= 10)
        );
      },
      {
        message: "Name must be at least 5 characters long",
      }
    ),
});
