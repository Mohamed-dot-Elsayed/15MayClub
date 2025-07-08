import { Response, Request } from "express";
import { complaintsCategory, complaints } from "../../models/schema";
import { db } from "../../models/db";
import { SuccessResponse } from "../../utils/response";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { v4 as uuidv4 } from "uuid";

export const createComplaints = async (req: Request, res: Response) => {
  const { categoryId, content } = req.body;
  const userId = req.user!.id;
  const [category] = await db
    .select()
    .from(complaintsCategory)
    .where(eq(complaintsCategory.id, categoryId));
  if (!category) throw new NotFound("Category not found");
  const complaintId = uuidv4();

  await db.insert(complaints).values({
    id: complaintId,
    userId,
    categoryId,
    content,
    seen: false,
    date: new Date(),
  });

  SuccessResponse(res, { message: "Complaint created successfully" }, 201);
};
