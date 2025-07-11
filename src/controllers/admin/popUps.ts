// controllers/popups.controller.ts
import { Request, Response } from "express";
import { db } from "../../models/db";
import { popUpsImages, popUpsPages } from "../../models/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { saveBase64Image } from "../../utils/handleImages";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { deletePhotoFromServer } from "../../utils/deleteImage";

export const createPopUp = async (req: Request, res: Response) => {
  let {
    title,
    imagePath,
    startDate,
    endDate,
    status = "active",
    pageIds,
  } = req.body;
  const id = uuidv4();
  imagePath = await saveBase64Image(imagePath, id, req, "popups");
  await db.transaction(async (tx) => {
    await tx
      .insert(popUpsImages)
      .values({ id, title, imagePath, startDate, endDate, status });
    await tx.insert(popUpsPages).values(
      pageIds.map((pageId: any) => ({
        id: uuidv4(),
        imageId: id,
        pageId,
      }))
    );
  });

  SuccessResponse(res, { message: "Popup created successfully" }, 201);
};

export const getAllPopUps = async (_req: Request, res: Response) => {
  const result = await db.select().from(popUpsImages);
  SuccessResponse(res, { popups: result }, 200);
};

export const getPopUpById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [popup] = await db
    .select()
    .from(popUpsImages)
    .where(eq(popUpsImages.id, id))
    .leftJoin(popUpsPages, eq(popUpsPages.imageId, popUpsImages.id));
  if (!popup) throw new NotFound("Popup not found");
  SuccessResponse(res, { popup: popup }, 200);
};

export const updatePopUp = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;

  await db.transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      const { pageIds, ...updateData } = data;
      await tx
        .update(popUpsImages)
        .set(updateData)
        .where(eq(popUpsImages.id, id));

      if (pageIds) {
        await tx.delete(popUpsPages).where(eq(popUpsPages.imageId, id));
        await tx.insert(popUpsPages).values(
          pageIds.map((pageId: any) => ({
            id: uuidv4(),
            imageId: id,
            pageId,
          }))
        );
      }
    }
  });

  SuccessResponse(res, { message: "Popup updated successfully" }, 200);
};

export const deletePopUp = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [popup] = await db
    .select()
    .from(popUpsImages)
    .where(eq(popUpsImages.id, id));
  if (!popup) throw new NotFound("Popup not found");
  await deletePhotoFromServer(popup.imagePath);
  await db.transaction(async (tx) => {
    await tx.delete(popUpsImages).where(eq(popUpsImages.id, id));
  });
  SuccessResponse(res, { message: "Popup deleted successfully" }, 200);
};
