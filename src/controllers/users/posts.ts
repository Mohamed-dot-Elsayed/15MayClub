import { Request, Response } from "express";
import { db } from "../../models/db";
import { posts, postsImages, reacts } from "../../models/schema";
import { eq, and, sql } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { v4 as uuidv4 } from "uuid";

const CATEGORY_IDS = {
  social: "63b99a53-60b3-11f0-908d-0050564dafeb",
  sport: "63b9af5e-60b3-11f0-908d-0050564dafeb",
  cultural: "779a5031-60b3-11f0-908d-0050564dafeb", // looks same as social? Check if typo
};

export const getPostsByCategory = async (req: Request, res: Response) => {
  const { type } = req.params;

  const categoryId = CATEGORY_IDS[type as keyof typeof CATEGORY_IDS];
  if (!categoryId) {
    throw new NotFound("Category Not Found");
  }

  const postsList = await db
    .select()
    .from(posts)
    .where(eq(posts.categoryId, categoryId))
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

export const getPostWithReacts = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user!.id;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .leftJoin(postsImages, eq(posts.id, postsImages.postId));

  if (!post) throw new NotFound("Post not found");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reacts)
    .where(eq(reacts.postId, postId));

  let reacted = false;
  if (userId) {
    const [userReact] = await db
      .select()
      .from(reacts)
      .where(and(eq(reacts.postId, postId), eq(reacts.userId, userId)));

    reacted = !!userReact;
    SuccessResponse(
      res,
      {
        post,
        reactsCount: count,
        reacted,
      },
      200
    );
  }
};
