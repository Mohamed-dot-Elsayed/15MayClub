"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCompetitionUser = exports.updateCompetition = exports.deleteCompetition = exports.getCompetitionImages = exports.getCompetitionUsers = exports.createCompetition = exports.getCompetition = exports.getAllCompetitions = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const uuid_1 = require("uuid");
const handleImages_1 = require("../../utils/handleImages");
const getAllCompetitions = async (req, res) => {
    const data = await db_1.db.select().from(schema_1.competitions);
    (0, response_1.SuccessResponse)(res, { competitions: data }, 200);
};
exports.getAllCompetitions = getAllCompetitions;
const getCompetition = async (req, res) => {
    const id = req.params.id;
    const [data] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!data)
        throw new Errors_1.NotFound("Competition not found");
    (0, response_1.SuccessResponse)(res, { competition: data }, 200);
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
            mainImagepath: (0, handleImages_1.saveBase64Image)(mainImagepath, id),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });
        if (images.length) {
            images.forEach(async (imagePath) => {
                await tx.insert(schema_1.competitionsImages).values({
                    id: (0, uuid_1.v4)(),
                    competitionId: id,
                    imagePath: (0, handleImages_1.saveBase64Image)(imagePath, id),
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
    const [data] = await db_1.db
        .select()
        .from(schema_1.userCompetition)
        .where((0, drizzle_orm_1.eq)(schema_1.userCompetition.id, id));
    if (!data)
        throw new Errors_1.NotFound("Competition not found");
    (0, response_1.SuccessResponse)(res, { competition: data }, 200);
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
        .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.id, id));
    (0, response_1.SuccessResponse)(res, { images_url: data }, 200);
};
exports.getCompetitionImages = getCompetitionImages;
const deleteCompetition = async (req, res) => {
    const id = req.params.id;
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    await db_1.db.transaction(async (tx) => {
        await tx.delete(schema_1.competitionsImages).where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.id, id));
        await tx.delete(schema_1.userCompetition).where((0, drizzle_orm_1.eq)(schema_1.userCompetition.id, id));
        await tx.delete(schema_1.competitions).where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    });
    (0, response_1.SuccessResponse)(res, { message: "Competition deleted successfully" }, 200);
};
exports.deleteCompetition = deleteCompetition;
const updateCompetition = async (req, res) => {
    const id = req.params.id;
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found");
    const data = req.body;
    if (data === undefined || Object.keys(data).length === 0)
        throw new Error("No data provided for update");
    const updates = {};
    if (data.name)
        updates.name = data.name;
    if (data.description)
        updates.description = data.description;
    if (data.mainImagepath)
        updates.mainImagepath = (0, handleImages_1.saveBase64Image)(data.mainImagepath, id);
    if (data.startDate)
        updates.startDate = data.startDate;
    if (data.endDate)
        updates.endDate = data.endDate;
    await db_1.db.update(schema_1.competitions).set(updates).where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Competition updated successfully" }, 200);
};
exports.updateCompetition = updateCompetition;
const removeCompetitionUser = async (req, res) => {
    const id = req.params.id;
    const userId = req.params.userId;
    const [competitionExists] = await db_1.db
        .select()
        .from(schema_1.userCompetition)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id), (0, drizzle_orm_1.eq)(schema_1.userCompetition.userId, userId)));
    if (!competitionExists)
        throw new Errors_1.NotFound("Competition not found or user not registered in competition");
    await db_1.db
        .delete(schema_1.userCompetition)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, id), (0, drizzle_orm_1.eq)(schema_1.userCompetition.userId, userId)));
    (0, response_1.SuccessResponse)(res, { message: "User removed from competition successfully" }, 200);
};
exports.removeCompetitionUser = removeCompetitionUser;
