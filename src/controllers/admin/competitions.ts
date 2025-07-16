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
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id));
  if (!competition) throw new NotFound("Competition not found");
  const competitionImagesd = await db
    .select()
    .from(competitionsImages)
    .where(eq(competitionsImages.competitionId, id));
  const formatted = {
    ...competition,
    startDate: competition?.startDate
      ? new Date(competition.startDate).toISOString().slice(0, 10)
      : null,
    endDate: competition?.endDate
      ? new Date(competition.endDate).toISOString().slice(0, 10)
      : null,
    competitionImagesd,
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
        const imageId = uuid4v();
        await tx.insert(competitionsImages).values({
          id: imageId,
          competitionId: id,
          imagePath: await saveBase64Image(
            imagePath,
            imageId,
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

  let { name, description, mainImagepath, startDate, endDate, images } =
    req.body;

  if (mainImagepath) {
    await deletePhotoFromServer(
      new URL(competitionExists.mainImagepath).pathname
    );
    mainImagepath = await saveBase64Image(
      mainImagepath,
      id,
      req,
      "competitionsMain"
    );
  }

  // Convert dates
  if (startDate)
    startDate = new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000);
  if (endDate)
    endDate = new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000);

  // Handle images
  if (Array.isArray(images)) {
    const existingImages = await db
      .select()
      .from(competitionsImages)
      .where(eq(competitionsImages.competitionId, id));

    const incomingIds = images
      .filter((img: any) => img.id && typeof img.id === "string")
      .map((img: any) => img.id);

    // 1. Delete removed images
    const toDelete = existingImages.filter(
      (img) => !incomingIds.includes(img.id)
    );

    for (const img of toDelete) {
      await deletePhotoFromServer(new URL(img.imagePath).pathname);
      await db
        .delete(competitionsImages)
        .where(eq(competitionsImages.id, img.id));
    }

    // 2. Add new base64 images
    for (const img of images) {
      if (!img.id && img.imagePath.startsWith("data:")) {
        const imageId = uuid4v();
        const savedPath = await saveBase64Image(
          img.imagePath,
          imageId,
          req,
          "competitionsImages"
        );
        await db.insert(competitionsImages).values({
          id: imageId,
          competitionId: id,
          imagePath: savedPath,
        });
      }
    }
  }

  // Update competition
  await db
    .update(competitions)
    .set({ name, description, startDate, endDate, mainImagepath })
    .where(eq(competitions.id, id));

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
