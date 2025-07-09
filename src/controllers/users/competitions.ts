import { Request, Response } from "express";
import { db } from "../../models/db";
import {
  competitions,
  competitionsImages,
  userCompetition,
} from "../../models/schema";
import { eq } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { v4 as uuidv4 } from "uuid";

export const getCompetition = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [competition] = await db
    .select()
    .from(competitions)
    .innerJoin(
      competitionsImages,
      eq(competitionsImages.competitionId, competitions.id)
    )
    .where(eq(competitions.id, id));

  if (!competition) throw new NotFound("Competition not found");

  SuccessResponse(res, { competition }, 200);
};

export const getAllCompetitions = async (req: Request, res: Response) => {
  const competitionsList = await db.select().from(competitions);
  SuccessResponse(res, { competitions: competitionsList }, 200);
};

export const participantsCompetitions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const comid = req.params.id;
  const data = req.body;
  const [comp] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, comid));
  if (comp) throw new NotFound("competition not found");
  await db.insert(userCompetition).values({
    id: uuidv4(),
    userId: userId,
    competitionId: comid,
    dateOfBirth: data.dateOfBirth,
    name: data.name,
    gender: data.gender,
  });
  SuccessResponse(res, { message: "user participant successful" }, 200);
};
