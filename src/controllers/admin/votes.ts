import { Response, Request } from "express";
import { db } from "../../models/db";
import { votes, votesItems } from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";

export const getAllVotes = async (req: Request, res: Response) => {
  const data = await db
    .select()
    .from(votes)
    .leftJoin(votesItems, eq(votes.id, votesItems.voteId));

  const grouped: Record<string, any> = {};

  for (const row of data) {
    const vote = row.votes;
    const item = row.votes_items;

    if (!grouped[vote.id]) {
      grouped[vote.id] = {
        name: vote.name,
        maxSelections: vote.maxSelections,
        options: [],
      };
    }

    if (item) {
      grouped[vote.id].options.push({
        id: item.id,
        text: item.item, // or item.text, depending on your field name
      });
    }
  }

  const result = Object.values(grouped);

  SuccessResponse(res, { votes: result }, 200);
};

export const getVote = async (req: Request, res: Response) => {
  const id = req.params.id;
  const vote = await db.query.votes.findFirst({ where: eq(votes.id, id) });
  if (!vote) {
    throw new NotFound("Vote not found");
  }
  const options = await db
    .select()
    .from(votesItems)
    .where(eq(votesItems.voteId, id));
  SuccessResponse(res, { vote: { ...vote, options } }, 200);
};

export const createVote = async (req: Request, res: Response) => {
  const { name, maxSelections, items } = req.body;
  const voteId = uuidv4();
  await db.transaction(async (tx) => {
    await tx.insert(votes).values({
      id: voteId,
      name,
      maxSelections,
    });
    if (items.length) {
      items.forEach(async (item: string) => {
        await tx.insert(votesItems).values({
          id: uuidv4(),
          voteId: voteId,
          item,
        });
      });
    }
  });
  SuccessResponse(res, { message: "vote created successfully" }, 201);
};

export const updateVote = async (req: Request, res: Response) => {
  const id = req.params.id;
  const vote = await db.query.votes.findFirst({ where: eq(votes.id, id) });
  if (!vote) throw new NotFound("Vote not found");
  const { name, maxSelections } = req.body;
  const updates: any = {};
  if (name) updates.name = name;
  if (maxSelections) updates.maxSelections = maxSelections;
  console.log("updates", updates);

  if (updates && Object.keys(updates).length > 0)
    await db.update(votes).set(updates).where(eq(votes.id, id));
  SuccessResponse(res, { message: "vote updated successfully" }, 200);
};

export const deleteVote = async (req: Request, res: Response) => {
  const id = req.params.id;
  const vote = await db.query.votes.findFirst({ where: eq(votes.id, id) });
  if (!vote) throw new NotFound("Vote not found");
  await db.transaction(async (tx) => {
    await tx.delete(votesItems).where(eq(votesItems.voteId, id));
    await tx.delete(votes).where(eq(votes.id, id));
  });
  SuccessResponse(res, { message: "vote deleted successfully" }, 200);
};
/*
import { db } from "@/db";
import { votes, voteItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

export const updateVoteWithOptions = async (req: Request, res: Response) => {
  const voteId = req.params.id;
  const { title, description, options } = req.body;

  await db.transaction(async (tx) => {
    // 1. Update the vote
    await tx.update(votes)
      .set({ title, description })
      .where(eq(votes.id, voteId));

    // 2. Handle each option
    for (const option of options) {
      if (option._delete && option.id) {
        // Delete vote item
        await tx.delete(voteItems).where(eq(voteItems.id, option.id));
      } else if (option.id) {
        // Update existing vote item
        await tx.update(voteItems)
          .set({ label: option.label })
          .where(eq(voteItems.id, option.id));
      } else {
        // Insert new vote item
        await tx.insert(voteItems).values({
          label: option.label,
          voteId: voteId,
        });
      }
    }
  });

  res.status(200).json({ message: "Vote and options updated successfully." });
};

 */

export const getOptions = async (req: Request, res: Response) => {};
export const createOption = async (req: Request, res: Response) => {};
export const deleteOption = async (req: Request, res: Response) => {};
