"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantsCompetitions = exports.getAllCompetitions = exports.getCompetition = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const uuid_1 = require("uuid");
const BadRequest_1 = require("../../Errors/BadRequest");
const getCompetition = async (req, res) => {
    const { id } = req.params;
    const [competition] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, id));
    const competitionImage = await db_1.db
        .select()
        .from(schema_1.competitionsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.competitionsImages.competitionId, id));
    if (!competition)
        throw new Errors_1.NotFound("Competition not found");
    (0, response_1.SuccessResponse)(res, { competition, competitionImage }, 200);
};
exports.getCompetition = getCompetition;
const getAllCompetitions = async (req, res) => {
    const competitionsList = await db_1.db.select().from(schema_1.competitions);
    (0, response_1.SuccessResponse)(res, { competitions: competitionsList }, 200);
};
exports.getAllCompetitions = getAllCompetitions;
const participantsCompetitions = async (req, res) => {
    const userId = req.user.id;
    const comid = req.params.id;
    const data = req.body;
    const [comp] = await db_1.db
        .select()
        .from(schema_1.competitions)
        .where((0, drizzle_orm_1.eq)(schema_1.competitions.id, comid));
    if (!comp)
        throw new Errors_1.NotFound("competition not found");
    const [participant] = await db_1.db
        .select()
        .from(schema_1.userCompetition)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userCompetition.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userCompetition.competitionId, comid)));
    if (participant)
        throw new BadRequest_1.BadRequest("You have already participated in this competition");
    await db_1.db.insert(schema_1.userCompetition).values({
        id: (0, uuid_1.v4)(),
        userId: userId,
        competitionId: comid,
        dateOfBirth: data.dateOfBirth,
        name: data.name,
        gender: data.gender,
    });
    (0, response_1.SuccessResponse)(res, { message: "user participant successful" }, 200);
};
exports.participantsCompetitions = participantsCompetitions;
