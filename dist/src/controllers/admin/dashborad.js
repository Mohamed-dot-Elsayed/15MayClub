"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintsCategories = exports.getRejectUser = exports.getHeader = void 0;
const db_1 = require("../../models/db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const getHeader = async (req, res) => {
    const [{ userCount }] = await db_1.db
        .select({ userCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.users);
    const [{ complaintCount }] = await db_1.db
        .select({ complaintCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.complaints);
    const [{ votesCount }] = await db_1.db
        .select({ votesCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.votes);
    const [{ postsCount }] = await db_1.db
        .select({ postsCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.posts);
    const [{ competitionsCount }] = await db_1.db
        .select({ competitionsCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.competitions);
    const [{ popupsCount }] = await db_1.db
        .select({ popupsCount: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.popUpsImages);
    (0, response_1.SuccessResponse)(res, {
        userCount,
        complaintCount,
        competitionsCount,
        votesCount,
        postsCount,
        popupsCount,
    }, 200);
};
exports.getHeader = getHeader;
const getRejectUser = async (req, res) => {
    const userRej = await db_1.db
        .select({
        name: schema_1.users.name,
        rejectionReason: schema_1.users.rejectionReason,
        rejectDate: schema_1.users.updatedAt,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.status, "rejected"))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.users.updatedAt));
    const formattedUsers = userRej.map((user) => ({
        ...user,
        rejectDate: user.rejectDate?.toISOString().split("T")[0], // Format: YYYY-MM-DD
    }));
    (0, response_1.SuccessResponse)(res, { users: formattedUsers }, 200);
};
exports.getRejectUser = getRejectUser;
const complaintsCategories = async (req, res) => {
    const complaintStats = await db_1.db
        .select({
        name: schema_1.complaintsCategory.name,
        percent: (0, drizzle_orm_1.sql) `ROUND(COUNT(*) * 100 / (SELECT COUNT(*) FROM ${schema_1.complaints}), 2)`,
    })
        .from(schema_1.complaints)
        .leftJoin(schema_1.complaintsCategory, (0, drizzle_orm_1.eq)(schema_1.complaints.categoryId, schema_1.complaintsCategory.id))
        .groupBy(schema_1.complaintsCategory.name);
    (0, response_1.SuccessResponse)(res, { complaintStats }, 200);
};
exports.complaintsCategories = complaintsCategories;
