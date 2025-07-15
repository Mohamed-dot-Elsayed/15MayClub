"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOption = exports.createOption = exports.updateOption = exports.getOption = exports.getAllOptions = exports.deleteVote = exports.updateVote = exports.createVote = exports.getVote = exports.getAllVotes = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const getAllVotes = async (req, res) => {
    const data = await db_1.db
        .select()
        .from(schema_1.votes)
        .leftJoin(schema_1.votesItems, (0, drizzle_orm_1.eq)(schema_1.votes.id, schema_1.votesItems.voteId));
    const grouped = {};
    for (const row of data) {
        const vote = row.votes;
        const item = row.votes_items;
        if (!grouped[vote.id]) {
            grouped[vote.id] = {
                id: vote.id,
                name: vote.name,
                maxSelections: vote.maxSelections,
                options: [],
            };
        }
        if (item) {
            grouped[vote.id].options.push({
                id: item.id,
                text: item.item, // or item.text, depending on your field name
            });
        }
    }
    const result = Object.values(grouped);
    (0, response_1.SuccessResponse)(res, { votes: result }, 200);
};
exports.getAllVotes = getAllVotes;
const getVote = async (req, res) => {
    const id = req.params.id;
    const vote = await db_1.db.query.votes.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.votes.id, id) });
    if (!vote) {
        throw new Errors_1.NotFound("Vote not found");
    }
    const options = await db_1.db
        .select()
        .from(schema_1.votesItems)
        .where((0, drizzle_orm_1.eq)(schema_1.votesItems.voteId, id));
    (0, response_1.SuccessResponse)(res, { vote: { ...vote, options } }, 200);
};
exports.getVote = getVote;
const createVote = async (req, res) => {
    const { name, maxSelections, items, startDate, endDate } = req.body;
    const voteId = (0, uuid_1.v4)();
    await db_1.db.transaction(async (tx) => {
        await tx.insert(schema_1.votes).values({
            id: voteId,
            name,
            maxSelections,
            startDate: new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000), // Adjusting for timezone
            endDate: new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000), // Adjusting for timezone
        });
        if (items) {
            if (items.length) {
                items.forEach(async (item) => {
                    await tx.insert(schema_1.votesItems).values({
                        id: (0, uuid_1.v4)(),
                        voteId: voteId,
                        item,
                    });
                });
            }
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "vote created successfully" }, 201);
};
exports.createVote = createVote;
const updateVote = async (req, res) => {
    const id = req.params.id;
    const vote = await db_1.db.query.votes.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.votes.id, id) });
    if (!vote)
        throw new Errors_1.NotFound("Vote not found");
    const { name, maxSelections, startDate, endDate } = req.body;
    const updates = {};
    if (name)
        updates.name = name;
    if (maxSelections)
        updates.maxSelections = maxSelections;
    if (startDate)
        updates.startDate = new Date(new Date(startDate).getTime() + 3 * 60 * 60 * 1000); // Adjusting for timezone
    if (endDate)
        updates.endDate = new Date(new Date(endDate).getTime() + 3 * 60 * 60 * 1000);
    console.log("updates", updates);
    if (updates && Object.keys(updates).length > 0)
        await db_1.db.update(schema_1.votes).set(updates).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
    (0, response_1.SuccessResponse)(res, { message: "vote updated successfully" }, 200);
};
exports.updateVote = updateVote;
const deleteVote = async (req, res) => {
    const id = req.params.id;
    const vote = await db_1.db.query.votes.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.votes.id, id) });
    if (!vote)
        throw new Errors_1.NotFound("Vote not found");
    await db_1.db.transaction(async (tx) => {
        await tx.delete(schema_1.votesItems).where((0, drizzle_orm_1.eq)(schema_1.votesItems.voteId, id));
        const userVotesList = await tx
            .select({ id: schema_1.userVotes.id })
            .from(schema_1.userVotes)
            .where((0, drizzle_orm_1.eq)(schema_1.userVotes.voteId, id));
        const userVoteIds = userVotesList.map((uv) => uv.id);
        if (userVoteIds.length > 0) {
            await tx
                .delete(schema_1.userVotesItems)
                .where((0, drizzle_orm_1.inArray)(schema_1.userVotesItems.userVoteId, userVoteIds));
            await tx.delete(schema_1.userVotes).where((0, drizzle_orm_1.eq)(schema_1.userVotes.voteId, id));
        }
        await tx.delete(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
    });
    (0, response_1.SuccessResponse)(res, { message: "vote deleted successfully" }, 200);
};
exports.deleteVote = deleteVote;
//options
const getAllOptions = async (req, res) => {
    const options = await db_1.db.select().from(schema_1.votesItems);
    if (!options.length) {
        throw new Errors_1.NotFound("No options found");
    }
    (0, response_1.SuccessResponse)(res, { options }, 200);
};
exports.getAllOptions = getAllOptions;
const getOption = async (req, res) => {
    const { id } = req.params;
    const option = await db_1.db.query.votesItems.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.votesItems.id, id),
    });
    if (!option)
        throw new Errors_1.NotFound("Option not found");
    (0, response_1.SuccessResponse)(res, { option }, 200);
};
exports.getOption = getOption;
const updateOption = async (req, res) => {
    const { item } = req.body;
    const id = req.params.id;
    const [itemV] = await db_1.db
        .select()
        .from(schema_1.votesItems)
        .where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, id));
    if (!itemV)
        throw new Errors_1.NotFound("option not found");
    await db_1.db.update(schema_1.votesItems).set({ item }).where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Option Updated Successfully" }, 200);
};
exports.updateOption = updateOption;
const createOption = async (req, res) => {
    const { item } = req.body;
    const id = (0, uuid_1.v4)();
    await db_1.db.insert(schema_1.votesItems).values({ id, item });
    (0, response_1.SuccessResponse)(res, { message: "Option Updated Successfully" }, 200);
};
exports.createOption = createOption;
const deleteOption = async (req, res) => {
    const { id } = req.params;
    const option = await db_1.db.query.votesItems.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.votesItems.id, id),
    });
    if (!option)
        throw new Errors_1.NotFound("Option not found");
    await db_1.db.delete(schema_1.votesItems).where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, id));
    (0, response_1.SuccessResponse)(res, { message: "option deleted" }, 200);
};
exports.deleteOption = deleteOption;
