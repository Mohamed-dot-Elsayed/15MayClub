import { Request, Response } from "express";
import { db } from "../../models/db";
import { admins } from "../../models/schema";
import { eq } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import bcrypt from "bcrypt";

export const getProfileData = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const [data] = await db.select().from(admins).where(eq(admins.id, userId));
  if (!data) throw new NotFound("not found " + userId);
  SuccessResponse(
    res,
    { name: data.name, email: data.email, phoneNumber: data.phoneNumber },
    200
  );
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const newData = req.body;
  const [data] = await db.select().from(admins).where(eq(admins.id, userId));
  if (!data) throw new NotFound("user not found");
  if (newData.password)
    newData.hashedPassword = await bcrypt.hash(newData.password, 10);
  await db.update(admins).set(newData).where(eq(admins.id, userId));
  SuccessResponse(res, { message: "updated successfully" }, 200);
};
