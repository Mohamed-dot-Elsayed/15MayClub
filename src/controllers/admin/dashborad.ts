import { Request, Response } from "express";
import { db } from "../../models/db";
import { count } from "drizzle-orm";

export const getHeader = async (req: Request, res: Response) => {
  const userCount = await db.select();
};
