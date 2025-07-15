// controllers/popups.controller.ts
import { Request, Response } from "express";
import { db } from "../../models/db";
import { appPages, popUpsImages, popUpsPages } from "../../models/schema";
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

  const formatted = result.map((popup) => ({
    ...popup,
    startDate: popup.startDate
      ? new Date(popup.startDate).toISOString().slice(0, 10)
      : null,
    endDate: popup.endDate
      ? new Date(popup.endDate).toISOString().slice(0, 10)
      : null,
  }));

  SuccessResponse(res, { popups: formatted }, 200);
};

export const getPopUpById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const [popup] = await db
    .select()
    .from(popUpsImages)
    .where(eq(popUpsImages.id, id));

  if (!popup) throw new NotFound("Popup not found");

  const pages = await db
    .select({
      pageName: appPages.name,
      pageId: appPages.id,
    })
    .from(popUpsPages)
    .where(eq(popUpsPages.imageId, id))
    .leftJoin(appPages, eq(appPages.id, popUpsPages.pageId));

  const formattedPopup = {
    ...popup,
    startDate: popup.startDate
      ? new Date(popup.startDate).toISOString().slice(0, 10)
      : null,
    endDate: popup.endDate
      ? new Date(popup.endDate).toISOString().slice(0, 10)
      : null,
  };

  SuccessResponse(res, { popup: { ...formattedPopup, pages } }, 200);
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
  await deletePhotoFromServer(new URL(popup.imagePath).pathname);
  await db.transaction(async (tx) => {
    await tx.delete(popUpsImages).where(eq(popUpsImages.id, id));
  });
  SuccessResponse(res, { message: "Popup deleted successfully" }, 200);
};

// App Pages
export const getAllAppPages = async (req: Request, res: Response) => {
  const Apppages = await db.select().from(appPages);
  SuccessResponse(res, { Apppages }, 200);
};

export const getAppPageById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [page] = await db.select().from(appPages).where(eq(appPages.id, id));
  if (!page) throw new NotFound("App page not found");
  SuccessResponse(res, { page }, 200);
};

export const createAppPage = async (req: Request, res: Response) => {
  const { name } = req.body;
  const id = uuidv4();
  await db.insert(appPages).values({ id, name });
  SuccessResponse(res, { message: "App page created successfully" }, 201);
};

export const updateAppPage = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name } = req.body;
  await db.update(appPages).set({ name }).where(eq(appPages.id, id));
  SuccessResponse(res, { message: "App page updated successfully" }, 200);
};

export const deleteAppPage = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [page] = await db.select().from(appPages).where(eq(appPages.id, id));
  if (!page) throw new NotFound("App page not found");
  await db.delete(appPages).where(eq(appPages.id, id));
  SuccessResponse(res, { message: "App page deleted successfully" }, 200);
};
