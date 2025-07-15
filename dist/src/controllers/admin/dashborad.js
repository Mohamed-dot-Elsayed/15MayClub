"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeader = void 0;
const db_1 = require("../../models/db");
const getHeader = async (req, res) => {
    const userCount = await db_1.db.select();
};
exports.getHeader = getHeader;
