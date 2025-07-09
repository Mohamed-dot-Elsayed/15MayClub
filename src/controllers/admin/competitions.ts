import { Request, Response } from "express";
import { db } from "../../models/db";
import {
  competitions,
  competitionsImages,
  userCompetition,
} from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { eq, and } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { v4 as uuid4v } from "uuid";
import { saveBase64Image } from "../../utils/handleImages";

export const getAllCompetitions = async (req: Request, res: Response) => {
  const data = await db.select().from(competitions);
  SuccessResponse(res, { competitions: data }, 200);
};

export const getCompetition = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [data] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!data) throw new NotFound("Competition not found");
  SuccessResponse(res, { competition: data }, 200);
};

export const createCompetition = async (req: Request, res: Response) => {
  const { name, description, mainImagepath, startDate, endDate, images } =
    req.body;
  const id = uuid4v();
  await db.transaction(async (tx) => {
    await tx.insert(competitions).values({
      id: id,
      name,
      description,
      mainImagepath: saveBase64Image(mainImagepath, id),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    if (images.length) {
      images.forEach(async (imagePath: string) => {
        await tx.insert(competitionsImages).values({
          id: uuid4v(),
          competitionId: id,
          imagePath: saveBase64Image(imagePath, id),
        });
      });
    }
  });
  SuccessResponse(res, { message: "Competition created successfully" }, 201);
};

export const getCompetitionUsers = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [competitionExists] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competitionExists) throw new NotFound("Competition not found");
  const [data] = await db
    .select()
    .from(userCompetition)
    .where(eq(userCompetition.id, id));
  if (!data) throw new NotFound("Competition not found");
  SuccessResponse(res, { competition: data }, 200);
};

export const getCompetitionImages = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [competitionExists] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competitionExists) throw new NotFound("Competition not found");
  const data = await db
    .select({
      image_path: competitionsImages.imagePath,
    })
    .from(competitionsImages)
    .where(eq(competitionsImages.id, id));
  SuccessResponse(res, { images_url: data }, 200);
};

export const deleteCompetition = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [competitionExists] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competitionExists) throw new NotFound("Competition not found");
  await db.transaction(async (tx) => {
    await tx.delete(competitionsImages).where(eq(competitionsImages.id, id));
    await tx.delete(userCompetition).where(eq(userCompetition.id, id));
    await tx.delete(competitions).where(eq(competitions.id, id));
  });
  SuccessResponse(res, { message: "Competition deleted successfully" }, 200);
};

export const updateCompetition = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [competitionExists] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competitionExists) throw new NotFound("Competition not found");
  const data = req.body;
  if (data === undefined || Object.keys(data).length === 0)
    throw new Error("No data provided for update");
  const updates: any = {};
  if (data.name) updates.name = data.name;
  if (data.description) updates.description = data.description;
  if (data.mainImagepath)
    updates.mainImagepath = saveBase64Image(data.mainImagepath, id);
  if (data.startDate) updates.startDate = data.startDate;
  if (data.endDate) updates.endDate = data.endDate;
  await db.update(competitions).set(updates).where(eq(competitions.id, id));
  SuccessResponse(res, { message: "Competition updated successfully" }, 200);
};

export const removeCompetitionUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.params.userId;
  const [competitionExists] = await db
    .select()
    .from(userCompetition)
    .where(
      and(
        eq(userCompetition.competitionId, id),
        eq(userCompetition.userId, userId)
      )
    );
  if (!competitionExists)
    throw new NotFound(
      "Competition not found or user not registered in competition"
    );
  await db
    .delete(userCompetition)
    .where(
      and(
        eq(userCompetition.competitionId, id),
        eq(userCompetition.userId, userId)
      )
    );
  SuccessResponse(
    res,
    { message: "User removed from competition successfully" },
    200
  );
};
