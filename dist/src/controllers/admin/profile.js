"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileData = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getProfileData = async (req, res) => {
    const userId = req.user.id;
    const data = await db_1.db.select().from(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.id, userId));
    (0, response_1.SuccessResponse)(res, data, 200);
};
exports.getProfileData = getProfileData;
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const newData = req.body;
    const [data] = await db_1.db.select().from(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.id, userId));
    if (!data)
        throw new Errors_1.NotFound("user not found");
    newData.hashedPassword = await bcrypt_1.default.hash(newData.password, 10);
    (0, response_1.SuccessResponse)(res, data, 200);
};
exports.updateProfile = updateProfile;
