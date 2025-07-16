"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlider = exports.updateSlider = exports.getSliderById = exports.getAllSlidersForAdmin = exports.createSlider = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const handleImages_1 = require("../../utils/handleImages");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const deleteImage_1 = require("../../utils/deleteImage");
const createSlider = async (req, res) => {
    const { name, status, order, images } = req.body;
    const id = (0, uuid_1.v4)();
    let newStatus = false;
    if (status === "active")
        newStatus = true;
    await db_1.db.insert(schema_1.sliders).values({ id, name, status: newStatus, order });
    images.forEach(async (imagePath) => {
        const imageId = (0, uuid_1.v4)();
        await db_1.db.insert(schema_1.sliderImages).values({
            id: imageId,
            slider_id: id,
            image_path: await (0, handleImages_1.saveBase64Image)(imagePath, imageId, req, "slider"),
        });
    });
    (0, response_1.SuccessResponse)(res, { message: "Slider created successfully" }, 201);
};
exports.createSlider = createSlider;
const getAllSlidersForAdmin = async (req, res) => {
    const data = await db_1.db
        .select()
        .from(schema_1.sliders)
        .orderBy(schema_1.sliders.order)
        .leftJoin(schema_1.sliderImages, (0, drizzle_orm_1.eq)(schema_1.sliders.id, schema_1.sliderImages.slider_id));
    (0, response_1.SuccessResponse)(res, { sliders: data }, 200);
};
exports.getAllSlidersForAdmin = getAllSlidersForAdmin;
const getSliderById = async (req, res) => {
    const id = req.params.id;
    const [slider] = await db_1.db
        .select()
        .from(schema_1.sliders)
        .where((0, drizzle_orm_1.eq)(schema_1.sliders.id, id))
        .leftJoin(schema_1.sliderImages, (0, drizzle_orm_1.eq)(schema_1.sliders.id, schema_1.sliderImages.slider_id));
    if (!slider)
        throw new Errors_1.NotFound("Slider not found");
    (0, response_1.SuccessResponse)(res, { slider }, 200);
};
exports.getSliderById = getSliderById;
const updateSlider = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    await db_1.db.transaction(async (tx) => {
        if (Object.keys(data).length > 0) {
            await tx.update(schema_1.sliders).set(data).where((0, drizzle_orm_1.eq)(schema_1.sliders.id, id));
        }
        if (data.images !== undefined && Object.keys(data.images).length > 0) {
            const sliderImagesd = await db_1.db
                .select()
                .from(schema_1.sliderImages)
                .where((0, drizzle_orm_1.eq)(schema_1.sliderImages.slider_id, id));
            sliderImagesd.forEach(async (image) => {
                await (0, deleteImage_1.deletePhotoFromServer)(new URL(image.id).pathname);
            });
            data.images.forEach(async (imagePath) => {
                const imageId = (0, uuid_1.v4)();
                await db_1.db.insert(schema_1.sliderImages).values({
                    id: imageId,
                    slider_id: id,
                    image_path: await (0, handleImages_1.saveBase64Image)(imagePath, imageId, req, "slider"),
                });
            });
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "Slider updated successfully" }, 200);
};
exports.updateSlider = updateSlider;
const deleteSlider = async (req, res) => {
    const id = req.params.id;
    const [slider] = await db_1.db.select().from(schema_1.sliders).where((0, drizzle_orm_1.eq)(schema_1.sliders.id, id));
    if (!slider)
        throw new Errors_1.NotFound("Slider not found");
    const images = await db_1.db
        .select()
        .from(schema_1.sliderImages)
        .where((0, drizzle_orm_1.eq)(schema_1.sliderImages.slider_id, id));
    for (const image of images) {
        if (image.image_path) {
            await (0, deleteImage_1.deletePhotoFromServer)(new URL(image.image_path).pathname); // or check return value
        }
    }
    await db_1.db.delete(schema_1.sliders).where((0, drizzle_orm_1.eq)(schema_1.sliders.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Slider deleted successfully" }, 200);
};
exports.deleteSlider = deleteSlider;
