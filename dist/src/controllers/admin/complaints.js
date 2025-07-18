"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComplaint = exports.changeComplaintStatus = exports.makeComplaintSeen = exports.getComplaint = exports.getAllComplaints = exports.updateComplaintsCategory = exports.deleteComplaintsCategory = exports.createComplaintsCategory = exports.getComplaintsCategory = exports.getAllComplaintsCategory = void 0;
const schema_1 = require("../../models/schema");
const db_1 = require("../../models/db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const uuid_1 = require("uuid");
// Complaints Category Handlers
const getAllComplaintsCategory = async (req, res) => {
    const data = await db_1.db
        .select()
        .from(schema_1.complaintsCategory)
        .orderBy(schema_1.complaintsCategory.createdAt);
    (0, response_1.SuccessResponse)(res, { categories: data }, 200);
};
exports.getAllComplaintsCategory = getAllComplaintsCategory;
const getComplaintsCategory = async (req, res) => {
    const { id } = req.params;
    const [data] = await db_1.db
        .select()
        .from(schema_1.complaintsCategory)
        .where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, id));
    if (!data)
        throw new Errors_1.NotFound("Category not found");
    (0, response_1.SuccessResponse)(res, { category: data }, 200);
};
exports.getComplaintsCategory = getComplaintsCategory;
const createComplaintsCategory = async (req, res) => {
    const { name, description } = req.body;
    await db_1.db
        .insert(schema_1.complaintsCategory)
        .values({
        id: (0, uuid_1.v4)(),
        name: name,
        description: description,
        createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    });
    (0, response_1.SuccessResponse)(res, { message: "Category created successfully" }, 201);
};
exports.createComplaintsCategory = createComplaintsCategory;
const deleteComplaintsCategory = async (req, res) => {
    const { id } = req.params;
    const [category] = await db_1.db
        .select()
        .from(schema_1.complaintsCategory)
        .where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, id));
    if (!category)
        throw new Errors_1.NotFound("Category not found");
    await db_1.db.delete(schema_1.complaintsCategory).where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Category deleted successfully" }, 200);
};
exports.deleteComplaintsCategory = deleteComplaintsCategory;
const updateComplaintsCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const [category] = await db_1.db
        .select()
        .from(schema_1.complaintsCategory)
        .where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, id));
    if (!category)
        throw new Errors_1.NotFound("Category not found");
    const updates = {};
    if (name)
        updates.name = name;
    if (description)
        updates.description = description;
    if (updates === undefined || Object.keys(updates).length === 0) {
        (0, response_1.SuccessResponse)(res, { message: "No updates provided" }, 200);
        return;
    }
    await db_1.db
        .update(schema_1.complaintsCategory)
        .set(updates)
        .where((0, drizzle_orm_1.eq)(schema_1.complaintsCategory.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Category updated successfully" }, 200);
};
exports.updateComplaintsCategory = updateComplaintsCategory;
// Complaints Handlers
const getAllComplaints = async (req, res) => {
    const data = await db_1.db
        .select({
        id: schema_1.complaints.id,
        description: schema_1.complaints.content,
        seen: schema_1.complaints.seen,
        date: schema_1.complaints.date,
        username: schema_1.users.name,
        categoryName: schema_1.complaintsCategory.name,
    })
        .from(schema_1.complaints)
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.complaints.userId, schema_1.users.id))
        .leftJoin(schema_1.complaintsCategory, (0, drizzle_orm_1.eq)(schema_1.complaints.categoryId, schema_1.complaintsCategory.id))
        .orderBy(schema_1.complaints.date);
    const formatData = data.map((dat) => ({
        ...dat,
        date: new Date(dat.date).toISOString().substring(0, 10),
    }));
    (0, response_1.SuccessResponse)(res, { complaints: formatData }, 200);
};
exports.getAllComplaints = getAllComplaints;
const getComplaint = async (req, res) => {
    const { id } = req.params;
    const [data] = await db_1.db
        .select({
        id: schema_1.complaints.id,
        description: schema_1.complaints.content,
        seen: schema_1.complaints.seen,
        date: schema_1.complaints.date,
        username: schema_1.users.name, // ✅ get username
        categoryName: schema_1.complaintsCategory.name, // ✅ get category name
    })
        .from(schema_1.complaints)
        .where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id))
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.complaints.userId, schema_1.users.id))
        .leftJoin(schema_1.complaintsCategory, (0, drizzle_orm_1.eq)(schema_1.complaints.categoryId, schema_1.complaintsCategory.id));
    if (!data)
        throw new Errors_1.NotFound("Complaint not found");
    const formatData = {
        ...data,
        date: new Date(data.date).toISOString().substring(0, 10),
    };
    (0, response_1.SuccessResponse)(res, { complaint: formatData }, 200);
};
exports.getComplaint = getComplaint;
const makeComplaintSeen = async (req, res) => {
    const id = req.params.id;
    const [data] = await db_1.db
        .select()
        .from(schema_1.complaints)
        .where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    if (!data)
        throw new Errors_1.NotFound("Complaint not found");
    await db_1.db.update(schema_1.complaints).set({ seen: true }).where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Complaint marked as seen" }, 200);
};
exports.makeComplaintSeen = makeComplaintSeen;
const changeComplaintStatus = async (req, res) => {
    const id = req.params.id;
    const [data] = await db_1.db
        .select()
        .from(schema_1.complaints)
        .where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    if (!data)
        throw new Errors_1.NotFound("Complaint not found");
    await db_1.db
        .update(schema_1.complaints)
        .set({ status: !data.status })
        .where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Complaint marked as seen" }, 200);
};
exports.changeComplaintStatus = changeComplaintStatus;
const deleteComplaint = async (req, res) => {
    const id = req.params.id;
    const [data] = await db_1.db
        .select()
        .from(schema_1.complaints)
        .where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    if (!data)
        throw new Errors_1.NotFound("Complaint not found");
    await db_1.db.delete(schema_1.complaints).where((0, drizzle_orm_1.eq)(schema_1.complaints.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Complaint deleted successful" }, 200);
};
exports.deleteComplaint = deleteComplaint;
