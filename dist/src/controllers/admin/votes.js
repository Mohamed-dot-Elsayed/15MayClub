"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOption = exports.getOption = exports.updateOptions = exports.getAllOptions = exports.deleteVote = exports.updateVote = exports.createVote = exports.getVote = exports.getAllVotes = void 0;
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
            startDate: new Date(startDate),
            endDate: new Date(endDate),
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
        updates.startDate = new Date(startDate);
    if (endDate)
        updates.endDate = new Date(endDate);
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
        await tx.delete(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
    });
    (0, response_1.SuccessResponse)(res, { message: "vote deleted successfully" }, 200);
};
exports.deleteVote = deleteVote;
const getAllOptions = async (req, res) => {
    const { voteId } = req.params;
    const options = await db_1.db
        .select()
        .from(schema_1.votesItems)
        .where((0, drizzle_orm_1.eq)(schema_1.votesItems.voteId, voteId));
    if (!options.length) {
        throw new Errors_1.NotFound("No options found for this vote");
    }
    (0, response_1.SuccessResponse)(res, { options }, 200);
};
exports.getAllOptions = getAllOptions;
const updateOptions = async (req, res) => {
    const { voteId } = req.params;
    const { items } = req.body;
    const [vote] = await db_1.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId));
    if (!vote) {
        throw new Errors_1.NotFound("vote not found");
    }
    await db_1.db.transaction(async (tx) => {
        for (const item of items) {
            const hasId = !!item.id;
            const hasValue = "value" in item;
            if (hasId && hasValue) {
                // Update existing item
                await tx
                    .update(schema_1.votesItems)
                    .set({ item: item.value })
                    .where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, item.id));
            }
            else if (!hasId && hasValue) {
                // Insert new item
                await tx
                    .insert(schema_1.votesItems)
                    .values({ id: (0, uuid_1.v4)(), voteId, item: item.value });
            }
            else if (hasId && !hasValue) {
                // Delete item
                await tx.delete(schema_1.votesItems).where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, item.id));
            }
        }
    });
    res.json({ message: "Vote items processed" });
};
exports.updateOptions = updateOptions;
const getOption = async (req, res) => {
    const { itemId } = req.params;
    const option = await db_1.db.query.votesItems.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.votesItems.id, itemId),
    });
    if (!option)
        throw new Errors_1.NotFound("Option not found");
    (0, response_1.SuccessResponse)(res, { option }, 200);
};
exports.getOption = getOption;
const deleteOption = async (req, res) => {
    const { itemId } = req.params;
    const option = await db_1.db.query.votesItems.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.votesItems.id, itemId),
    });
    if (!option)
        throw new Errors_1.NotFound("Option not found");
    await db_1.db.delete(schema_1.votesItems).where((0, drizzle_orm_1.eq)(schema_1.votesItems.id, itemId));
    (0, response_1.SuccessResponse)(res, { message: "option deleted" }, 200);
};
exports.deleteOption = deleteOption;
