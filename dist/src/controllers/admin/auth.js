"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
async function login(req, res) {
    const data = req.body;
    const admin = await db_1.db.query.admins.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.admins.email, data.email),
    });
    if (!admin) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    const match = await bcrypt_1.default.compare(data.password, admin.hashedPassword);
    if (!match) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    const token = (0, auth_1.generateToken)({
        id: admin.id,
        name: admin.name,
        role: "admin",
    });
    (0, response_1.SuccessResponse)(res, { message: "login Successful", token: token }, 200);
}
