import { Request, Response } from "express";
import { db } from "../../models/db";
import {
  competitions,
  competitionsImages,
  userCompetition,
} from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { eq, and } from "drizzle-orm";
import { ConflictError, NotFound } from "../../Errors";
import { v4 as uuid4v } from "uuid";
import { saveBase64Image } from "../../utils/handleImages";
import { deletePhotoFromServer } from "../../utils/deleteImage";

export const getAllCompetitions = async (req: Request, res: Response) => {
  const data = await db.select().from(competitions);

  const formatted = data.map((comp) => ({
    ...comp,
    startDate: comp.startDate
      ? new Date(comp.startDate).toISOString().slice(0, 10)
      : null,
    endDate: comp.endDate
      ? new Date(comp.endDate).toISOString().slice(0, 10)
      : null,
  }));

  SuccessResponse(res, { competitions: formatted }, 200);
};

export const getCompetition = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [data] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));

  if (!data) throw new NotFound("Competition not found");

  const formatted = {
    ...data,
    startDate: data.startDate
      ? new Date(data.startDate).toISOString().slice(0, 10)
      : null,
    endDate: data.endDate
      ? new Date(data.endDate).toISOString().slice(0, 10)
      : null,
  };

  SuccessResponse(res, { competition: formatted }, 200);
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
      mainImagepath: await saveBase64Image(
        mainImagepath,
        id,
        req,
        "competitionsMain"
      ),
      startDate: new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000),
      endDate: new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000),
    });
    if (images !== undefined && Object.keys(images).length > 0) {
      images.forEach(async (imagePath: any) => {
        await tx.insert(competitionsImages).values({
          id: uuid4v(),
          competitionId: id,
          imagePath: await saveBase64Image(
            imagePath,
            id,
            req,
            "competitionsImages"
          ),
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
  const data = await db
    .select()
    .from(userCompetition)
    .where(eq(userCompetition.competitionId, id));

  const formatted = data.map((item) => ({
    ...item,
    dateOfBirth: item.dateOfBirth.toISOString().split("T")[0],
  }));

  SuccessResponse(res, { users: formatted }, 200);
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
    .where(eq(competitionsImages.competitionId, id));
  SuccessResponse(res, { images_url: data }, 200);
};

export const deleteCompetition = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log("here" + id);
  const [competitionExists] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competitionExists) throw new NotFound("Competition not found");
  const deleted = await deletePhotoFromServer(
    new URL(competitionExists.mainImagepath).pathname
  );
  if (!deleted)
    throw new ConflictError("Failed to delete main image from server");
  await db.transaction(async (tx) => {
    const images = await db
      .select()
      .from(competitionsImages)
      .where(eq(competitionsImages.competitionId, id));
    if (images && images.length > 0) {
      images.forEach(async (img) => {
        const deleted = await deletePhotoFromServer(
          new URL(img.imagePath).pathname
        );
        if (!deleted)
          throw new ConflictError("Failed to delete inner image from server");
      });
      await tx
        .delete(competitionsImages)
        .where(eq(competitionsImages.competitionId, id));
      await tx
        .delete(userCompetition)
        .where(eq(userCompetition.competitionId, id));
      await tx.delete(competitions).where(eq(competitions.id, id));
    }
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
  if (data.mainImagepath)
    data.mainImagepath = await saveBase64Image(
      data.mainImagepath,
      id,
      req,
      "competitionsMain"
    );
  if (data.startDate)
    data.startDate = new Date(
      new Date(data.startDate).getTime() + 3 * 60 * 60 * 1000
    );
  if (data.endDate)
    data.endDate = new Date(
      new Date(data.endDate).getTime() + 3 * 60 * 60 * 1000
    );
  await db.update(competitions).set(data).where(eq(competitions.id, id));
  SuccessResponse(res, { message: "Competition updated successfully" }, 200);
};

// Not Complete
export const updateCompetitionImages = async (
  req: Request,
  res: Response
) => {};

export const removeCompetitionUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.params.userId;
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));

  if (!competition) throw new NotFound("Competition not found");

  // Check if user is registered
  const [userInComp] = await db
    .select()
    .from(userCompetition)
    .where(
      and(
        eq(userCompetition.competitionId, id),
        eq(userCompetition.userId, userId)
      )
    );

  if (!userInComp)
    throw new NotFound("User not registered in this competition");
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
