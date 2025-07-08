import { Response, Request } from "express";
import { complaintsCategory, complaints } from "../../models/schema";
import { db } from "../../models/db";
import { SuccessResponse } from "../../utils/response";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { v4 as uuidv4 } from "uuid";

// Complaints Category Handlers
export const getAllComplaintsCategory = async (req: Request, res: Response) => {
  const data = await db.select().from(complaintsCategory);
  SuccessResponse(res, { categories: data }, 200);
};

export const getComplaintsCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [data] = await db
    .select()
    .from(complaintsCategory)
    .where(eq(complaintsCategory.id, id));
  if (!data) throw new NotFound("Category not found");
  SuccessResponse(res, { category: data }, 200);
};

export const createComplaintsCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  await db.insert(complaintsCategory).values({ id: uuidv4(), name: name });
  SuccessResponse(res, { message: "Category created successfully" }, 201);
};

export const deleteComplaintsCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [category] = await db
    .select()
    .from(complaintsCategory)
    .where(eq(complaintsCategory.id, id));
  if (!category) throw new NotFound("Category not found");
  await db.delete(complaintsCategory).where(eq(complaintsCategory.id, id));
  SuccessResponse(res, { message: "Category deleted successfully" }, 200);
};

export const updateComplaintsCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const [category] = await db
    .select()
    .from(complaintsCategory)
    .where(eq(complaintsCategory.id, id));
  if (!category) throw new NotFound("Category not found");
  await db
    .update(complaintsCategory)
    .set({ name })
    .where(eq(complaintsCategory.id, id));
  SuccessResponse(res, { message: "Category updated successfully" }, 200);
};

// Complaints Handlers
export const getAllComplaints = async (req: Request, res: Response) => {
  const data = await db.select().from(complaints);
  SuccessResponse(res, { complaints: data }, 200);
};

export const getComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [data] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, id));
  if (!data) throw new NotFound("Complaint not found");
  SuccessResponse(res, { complaint: data }, 200);
};

export const makeComplaintSeen = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [data] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, id));
  if (!data) throw new NotFound("Complaint not found");
  await db.update(complaints).set({ seen: true }).where(eq(complaints.id, id));
  SuccessResponse(res, { message: "Complaint marked as seen" }, 200);
};

export const changeComplaintStatus = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [data] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, id));
  if (!data) throw new NotFound("Complaint not found");
  await db
    .update(complaints)
    .set({ status: !data.status })
    .where(eq(complaints.id, id));
  SuccessResponse(res, { message: "Complaint marked as seen" }, 200);
};

export const deleteComplaint = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [data] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, id));
  if (!data) throw new NotFound("Complaint not found");
  await db.delete(complaints).where(eq(complaints.id, id));
  SuccessResponse(res, { message: "Complaint deleted successful" }, 200);
};
