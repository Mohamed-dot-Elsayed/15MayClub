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
        .leftJoin(schema_1.sliderImages, (0, drizzle_orm_1.eq)(schema_1.sliderImages.slider_id, schema_1.sliders.id));
    const groupedSliders = data.reduce((acc, curr) => {
        const slider = curr.sliders;
        const image = curr.slider_images?.image_path || null;
        const existing = acc.find((s) => s.id === slider.id);
        if (existing) {
            if (image)
                existing.images.push(image);
        }
        else {
            acc.push({
                id: slider.id,
                name: slider.name,
                order: slider.order,
                status: slider.status,
                images: image ? [image] : [],
            });
        }
        return acc;
    }, []);
    (0, response_1.SuccessResponse)(res, { sliders: groupedSliders }, 200);
};
exports.getAllSlidersForAdmin = getAllSlidersForAdmin;
const getSliderById = async (req, res) => {
    const id = req.params.id;
    const slider = await db_1.db
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
        // Update slider fields except images
        const { images, ...rest } = data;
        if (Object.keys(rest).length > 0) {
            await tx.update(schema_1.sliders).set(rest).where((0, drizzle_orm_1.eq)(schema_1.sliders.id, id));
        }
        // Handle images logic
        if (Array.isArray(images)) {
            // 1. Delete given images (with id + image_path)
            const deletions = images.filter((img) => img.id && img.image_path && !img.image_path.startsWith("data:"));
            for (const img of deletions) {
                await (0, deleteImage_1.deletePhotoFromServer)(new URL(img.image_path).pathname);
                await tx.delete(schema_1.sliderImages).where((0, drizzle_orm_1.eq)(schema_1.sliderImages.id, img.id));
            }
            // 2. Add new images (base64 only)
            const additions = images.filter((img) => !img.id && img.image_path && img.image_path.startsWith("data:"));
            for (const img of additions) {
                const imageId = (0, uuid_1.v4)();
                const savedPath = await (0, handleImages_1.saveBase64Image)(img.image_path, imageId, req, "slider");
                await tx.insert(schema_1.sliderImages).values({
                    id: imageId,
                    slider_id: id,
                    image_path: savedPath,
                });
            }
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
