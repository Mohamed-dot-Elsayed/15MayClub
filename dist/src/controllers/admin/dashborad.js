"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeader = void 0;
const db_1 = require("../../models/db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../models/schema");
const getHeader = async (req, res) => {
    const [{ count }] = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema_1.users);
};
exports.getHeader = getHeader;
