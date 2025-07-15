import { Request, Response } from "express";
import { db } from "../../models/db";
import { eq, sql } from "drizzle-orm";
import {
  competitions,
  complaints,
  popUpsImages,
  posts,
  users,
  votes,
} from "../../models/schema";
import { SuccessResponse } from "../../utils/response";

export const getHeader = async (req: Request, res: Response) => {
  const [{ userCount }] = await db
    .select({ userCount: sql<number>`COUNT(*)` })
    .from(users);
  const [{ complaintCount }] = await db
    .select({ complaintCount: sql<number>`COUNT(*)` })
    .from(complaints);
  const [{ votesCount }] = await db
    .select({ votesCount: sql<number>`COUNT(*)` })
    .from(votes);
  const [{ postsCount }] = await db
    .select({ postsCount: sql<number>`COUNT(*)` })
    .from(posts);
  const [{ competitionsCount }] = await db
    .select({ competitionsCount: sql<number>`COUNT(*)` })
    .from(competitions);
  const [{ popupsCount }] = await db
    .select({ popupsCount: sql<number>`COUNT(*)` })
    .from(popUpsImages);
  SuccessResponse(
    res,
    {
      userCount,
      complaintCount,
      competitionsCount,
      votesCount,
      postsCount,
      popupsCount,
    },
    200
  );
};

export const getRejectUser = async (req: Request, res: Response) => {
  const userRej = await db
    .select({
      name: users.name,
      rejectionReason: users.rejectionReason,
      rejectDate: users.updatedAt,
    })
    .from(users)
    .where(eq(users.status, "rejected"))
    .orderBy(users.updatedAt);

  const formattedUsers = userRej.map((user) => ({
    ...user,
    rejectDate: user.rejectDate?.toISOString().split("T")[0], // Format: YYYY-MM-DD
  }));

  SuccessResponse(res, { users: formattedUsers }, 200);
};
