"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComplaintsCategory = exports.createComplaints = void 0;
const schema_1 = require("../../models/schema");
const db_1 = require("../../models/db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const uuid_1 = require("uuid");
const createComplaints = async (req, res) => {
    const { categoryId, content } = req.body;
    const userId = req.user.id;
    const [category] = await db_1.db
        .select()
        .from(schema_1.complaintsCategory)
        .where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, categoryId));
    if (!category)
        throw new Errors_1.NotFound("Category not found");
    const complaintId = (0, uuid_1.v4)();
    await db_1.db.insert(schema_1.complaints).values({
        id: complaintId,
        userId,
        categoryId,
        content,
        seen: false,
        date: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    });
    (0, response_1.SuccessResponse)(res, { message: "Complaint created successfully" }, 201);
};
exports.createComplaints = createComplaints;
const getComplaintsCategory = async (req, res) => {
    const categories = await db_1.db
        .select({
        id: schema_1.complaintsCategory.id,
        name: schema_1.complaintsCategory.name,
    })
        .from(schema_1.complaintsCategory);
    (0, response_1.SuccessResponse)(res, { categories }, 200);
};
exports.getComplaintsCategory = getComplaintsCategory;
