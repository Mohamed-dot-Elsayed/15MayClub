import { Response, Request } from "express";
import { db } from "../../models/db";
import { votes, votesItems } from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { v4 as uuidv4 } from "uuid";
import { eq, inArray } from "drizzle-orm";
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
  const { name, maxSelections, items, startDate, endDate } = req.body;
  const voteId = uuidv4();
  await db.transaction(async (tx) => {
    await tx.insert(votes).values({
      id: voteId,
      name,
      maxSelections,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    if (items) {
      if (items.length) {
        items.forEach(async (item: string) => {
          await tx.insert(votesItems).values({
            id: uuidv4(),
            voteId: voteId,
            item,
          });
        });
      }
    }
  });
  SuccessResponse(res, { message: "vote created successfully" }, 201);
};

export const updateVote = async (req: Request, res: Response) => {
  const id = req.params.id;
  const vote = await db.query.votes.findFirst({ where: eq(votes.id, id) });
  if (!vote) throw new NotFound("Vote not found");
  const { name, maxSelections, startDate, endDate } = req.body;
  const updates: any = {};
  if (name) updates.name = name;
  if (maxSelections) updates.maxSelections = maxSelections;
  if (startDate) updates.startDate = new Date(startDate);
  if (endDate) updates.endDate = new Date(endDate);
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

export const getAllOptions = async (req: Request, res: Response) => {
  const { voteId } = req.params;
  const options = await db
    .select()
    .from(votesItems)
    .where(eq(votesItems.voteId, voteId));

  if (!options.length) {
    throw new NotFound("No options found for this vote");
  }

  SuccessResponse(res, { options }, 200);
};

export const updateOptions = async (req: Request, res: Response) => {
  const { voteId } = req.params;
  const { items } = req.body;
  const [vote] = await db.select().from(votes).where(eq(votes.id, voteId));
  if (!vote) {
    throw new NotFound("vote not found");
  }
  await db.transaction(async (tx) => {
    for (const item of items) {
      const hasId = !!item.id;
      const hasValue = "value" in item;

      if (hasId && hasValue) {
        // Update existing item
        await tx
          .update(votesItems)
          .set({ item: item.value })
          .where(eq(votesItems.id, item.id));
      } else if (!hasId && hasValue) {
        // Insert new item
        await tx
          .insert(votesItems)
          .values({ id: uuidv4(), voteId, item: item.value });
      } else if (hasId && !hasValue) {
        // Delete item
        await tx.delete(votesItems).where(eq(votesItems.id, item.id));
      }
    }
  });

  res.json({ message: "Vote items processed" });
};

export const getOption = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const option = await db.query.votesItems.findFirst({
    where: eq(votesItems.id, itemId),
  });
  if (!option) throw new NotFound("Option not found");
  SuccessResponse(res, { option }, 200);
};

export const deleteOption = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const option = await db.query.votesItems.findFirst({
    where: eq(votesItems.id, itemId),
  });
  if (!option) throw new NotFound("Option not found");
  await db.delete(votesItems).where(eq(votesItems.id, itemId));
  SuccessResponse(res, { message: "option deleted" }, 200);
};
