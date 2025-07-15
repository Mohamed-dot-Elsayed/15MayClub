import { Request, Response } from "express";
import { db } from "../../models/db";
import { sql } from "drizzle-orm";
import { users } from "../../models/schema";

export const getHeader = async (req: Request, res: Response) => {
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);
};
