"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCompetitionUser = exports.updateCompetitionImages = exports.updateCompetition = exports.deleteCompetition = exports.getCompetitionImages = exports.getCompetitionUsers = exports.createCompetition = exports.getCompetition = exports.getAllCompetitions = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const uuid_1 = require("uuid");
const handleImages_1 = require("../../utils/handleImages");
const deleteImage_1 = require("../../utils/deleteImage");
const getAllCompetitions = async (req, res) => {
    const data = await db_1.db
        .select()
        .from(schema_1.competitions)
        .orderBy(schema_1.competitions.createdAt);
    const formatted = data.map((comp) => ({
        ...comp,
        startDate: comp.startDate
            ? new Date(comp.startDate).toISOString().slice(0, 10)
            : null,
        endDate: comp.endDate
            ? new Date(comp.endDate).toISOString().slice(0, 10)
            : null,
    }));
    (0, response_1.SuccessResponse)(res, { competitions: formatted }, 200);
};
exports.getAllCompetitions = getAllCompetitions;
const getCompetition = async (req, res) => {
    const id = req.params.id;
    const [competition] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competition)
        throw new Errors_1.NotFound("Competition not found");
    const competitionImagesd = await db_1.db
        .select()
        .from(schema_1.competitionsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.competitionId, id));
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
    (0, response_1.SuccessResponse)(res, { competition: formatted }, 200);
};
exports.getCompetition = getCompetition;
const createCompetition = async (req, res) => {
    const { name, description, mainImagepath, startDate, endDate, images } = req.body;
    const id = (0, uuid_1.v4)();
    await db_1.db.transaction(async (tx) => {
        await tx.insert(schema_1.competitions).values({
            id: id,
            name,
            description,
            mainImagepath: await (0, handleImages_1.saveBase64Image)(mainImagepath, id, req, "competitionsMain"),
            startDate: new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000),
            endDate: new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000),
            createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
        });
        if (images !== undefined && Object.keys(images).length > 0) {
            images.forEach(async (imagePath) => {
                const imageId = (0, uuid_1.v4)();
                await tx.insert(schema_1.competitionsImages).values({
                    id: imageId,
                    competitionId: id,
                    imagePath: await (0, handleImages_1.saveBase64Image)(imagePath, imageId, req, "competitionsImages"),
                });
            });
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "Competition created successfully" }, 201);
};
exports.createCompetition = createCompetition;
const getCompetitionUsers = async (req, res) => {
    const id = req.params.id;
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    const data = await db_1.db
        .select()
        .from(schema_1.userCompetition)
        .where((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id));
    const formatted = data.map((item) => ({
        ...item,
        dateOfBirth: item.dateOfBirth.toISOString().split("T")[0],
    }));
    (0, response_1.SuccessResponse)(res, { users: formatted }, 200);
};
exports.getCompetitionUsers = getCompetitionUsers;
const getCompetitionImages = async (req, res) => {
    const id = req.params.id;
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    const data = await db_1.db
        .select({
        image_path: schema_1.competitionsImages.imagePath,
    })
        .from(schema_1.competitionsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.competitionId, id));
    (0, response_1.SuccessResponse)(res, { images_url: data }, 200);
};
exports.getCompetitionImages = getCompetitionImages;
const deleteCompetition = async (req, res) => {
    const id = req.params.id;
    console.log("here" + id);
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    const deleted = await (0, deleteImage_1.deletePhotoFromServer)(new URL(competitionExists.mainImagepath).pathname);
    if (!deleted)
        throw new Errors_1.ConflictError("Failed to delete main image from server");
    await db_1.db.transaction(async (tx) => {
        const images = await db_1.db
            .select()
            .from(schema_1.competitionsImages)
            .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.competitionId, id));
        if (images && images.length > 0) {
            images.forEach(async (img) => {
                const deleted = await (0, deleteImage_1.deletePhotoFromServer)(new URL(img.imagePath).pathname);
                if (!deleted)
                    throw new Errors_1.ConflictError("Failed to delete inner image from server");
            });
            await tx
                .delete(schema_1.competitionsImages)
                .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.competitionId, id));
            await tx
                .delete(schema_1.userCompetition)
                .where((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id));
            await tx.delete(schema_1.competitions).where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "Competition deleted successfully" }, 200);
};
exports.deleteCompetition = deleteCompetition;
const updateCompetition = async (req, res) => {
    const id = req.params.id;
    // Check if competition exists
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    let { name, description, mainImagepath, startDate, endDate, images } = req.body;
    // Handle main image update (only if base64)
    if (mainImagepath && mainImagepath.startsWith("data:")) {
        await (0, deleteImage_1.deletePhotoFromServer)(new URL(mainImagepath).pathname);
        mainImagepath = await (0, handleImages_1.saveBase64Image)(mainImagepath, id, req, "competitionsMain");
    }
    // Adjust dates
    if (startDate)
        startDate = new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000);
    if (endDate)
        endDate = new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000);
    await db_1.db.transaction(async (tx) => {
        // 1. Update text fields
        await tx
            .update(schema_1.competitions)
            .set({ name, description, mainImagepath, startDate, endDate })
            .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
        // 2. Handle image logic
        if (Array.isArray(images)) {
            // a) Delete images with id + imagePath
            const deletions = images.filter((img) => img.id && img.imagePath && !img.imagePath.startsWith("data:"));
            for (const img of deletions) {
                await (0, deleteImage_1.deletePhotoFromServer)(new URL(img.imagePath).pathname);
                await tx
                    .delete(schema_1.competitionsImages)
                    .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.id, img.id));
            }
            // b) Add new base64 images
            const additions = images.filter((img) => !img.id && img.imagePath && img.imagePath.startsWith("data:"));
            for (const img of additions) {
                const imageId = (0, uuid_1.v4)();
                const savedPath = await (0, handleImages_1.saveBase64Image)(img.imagePath, imageId, req, "competitionsImages");
                await tx.insert(schema_1.competitionsImages).values({
                    id: imageId,
                    competitionId: id,
                    imagePath: savedPath,
                });
            }
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "Competition updated successfully" }, 200);
};
exports.updateCompetition = updateCompetition;
// Not Complete
const updateCompetitionImages = async (req, res) => { };
exports.updateCompetitionImages = updateCompetitionImages;
const removeCompetitionUser = async (req, res) => {
    const id = req.params.id;
    const userId = req.params.userId;
    const [competition] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competition)
        throw new Errors_1.NotFound("Competition not found");
    // Check if user is registered
    const [userInComp] = await db_1.db
        .select()
        .from(schema_1.userCompetition)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id), (0, drizzle_orm_1.eq)(schema_1.userCompetition.userId, userId)));
    if (!userInComp)
        throw new Errors_1.NotFound("User not registered in this competition");
    await db_1.db
        .delete(schema_1.userCompetition)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id), (0, drizzle_orm_1.eq)(schema_1.userCompetition.userId, userId)));
    (0, response_1.SuccessResponse)(res, { message: "User removed from competition successfully" }, 200);
};
exports.removeCompetitionUser = removeCompetitionUser;
