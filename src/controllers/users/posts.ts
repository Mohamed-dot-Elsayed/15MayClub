import { Request, Response } from "express";
import { db } from "../../models/db";
import { posts, postsImages, reacts } from "../../models/schema";
import { eq, and, sql } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { v4 as uuidv4 } from "uuid";

export const getPosts = async (req: Request, res: Response) => {
  const postsList = await db
    .select()
    .from(posts)
    .leftJoin(postsImages, eq(posts.id, postsImages.postId));
  SuccessResponse(res, { posts: postsList }, 200);
};

export const reactPost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user!.id;
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) throw new NotFound("Post not found");
  const [liked] = await db
    .select()
    .from(reacts)
    .where(and(eq(reacts.postId, postId), eq(reacts.userId, userId)));
  if (liked)
    await db
      .delete(reacts)
      .where(and(eq(reacts.postId, postId), eq(reacts.userId, userId)));
  else await db.insert(reacts).values({ id: uuidv4(), postId, userId });
  SuccessResponse(res, { messafe: "User Liked Success" }, 200);
};

export const getPostReacts = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) throw new NotFound("Post not found");
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reacts)
    .where(eq(reacts.postId, postId));

  const reactsCount = count;
  SuccessResponse(res, { reactsCount: reactsCount }, 200);
};
