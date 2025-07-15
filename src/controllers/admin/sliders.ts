// controllers/slider.controller.ts
import { Request, Response } from "express";
import { db } from "../../models/db";
import { sliders, sliderImages } from "../../models/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import {
  createSliderSchema,
  updateSliderSchema,
} from "../../validators/admin/sliders";
import { saveBase64Image } from "../../utils/handleImages";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { deletePhotoFromServer } from "../../utils/deleteImage";

export const createSlider = async (req: Request, res: Response) => {
  const { name, status, order, images } = req.body;
  const id = uuidv4();
  let newStatus = false;
  if (status === "active") newStatus = true;
  await db.transaction(async (tx) => {
    await tx.insert(sliders).values({ id, name, status: newStatus, order });
    const imageValues = await Promise.all(
      images.map(async (img: any) => {
        const image_id = uuidv4();
        return {
          id: image_id,
          slider_id: id,
          image_path: await saveBase64Image(img, image_id, req, "slider"), // pass image_id if needed
        };
      })
    );
    await tx.insert(sliderImages).values(imageValues);
  });

  SuccessResponse(res, { message: "Slider created successfully" }, 201);
};

export const getAllSlidersForAdmin = async (req: Request, res: Response) => {
  const data = await db
    .select()
    .from(sliders)
    .orderBy(sliders.order)
    .leftJoin(sliderImages, eq(sliders.id, sliderImages.slider_id));
  SuccessResponse(res, { sliders: data }, 200);
};

export const getSliderById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [slider] = await db
    .select()
    .from(sliders)
    .where(eq(sliders.id, id))
    .leftJoin(sliderImages, eq(sliders.id, sliderImages.slider_id));
  if (!slider) throw new NotFound("Slider not found");
  SuccessResponse(res, { slider }, 200);
};

export const updateSlider = async (req: Request, res: Response) => {
  const id = req.params.id;

  const data = req.body;

  await db.transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.update(sliders).set(data).where(eq(sliders.id, id));
    }

    if (data.images) {
      const images = await db
        .select()
        .from(sliderImages)
        .where(eq(sliderImages.slider_id, id));

      for (const image of images) {
        if (image.image_path) {
          await deletePhotoFromServer(image.image_path); // or check return value
        }
      }
      await tx.delete(sliderImages).where(eq(sliderImages.slider_id, id));
      const imageValues = await Promise.all(
        data.images.map(async (img: any) => {
          const image_id = uuidv4();
          return {
            id: image_id,
            slider_id: id,
            image_path: await saveBase64Image(img, image_id, req, "slider"), // pass image_id if needed
          };
        })
      );
      await tx.insert(sliderImages).values(imageValues);
    }
  });

  SuccessResponse(res, { message: "Slider updated successfully" }, 200);
};

export const deleteSlider = async (req: Request, res: Response) => {
  const id = req.params.id;
  const [slider] = await db.select().from(sliders).where(eq(sliders.id, id));
  if (!slider) throw new NotFound("Slider not found");

  const images = await db
    .select()
    .from(sliderImages)
    .where(eq(sliderImages.slider_id, id));

  for (const image of images) {
    if (image.image_path) {
      await deletePhotoFromServer(image.image_path); // or check return value
    }
  }
  await db.delete(sliders).where(eq(sliders.id, id));

  SuccessResponse(res, { message: "Slider deleted successfully" }, 200);
};
