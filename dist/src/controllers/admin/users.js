"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPendingUsers = exports.getAllRejectedUsers = exports.rejectUser = exports.approveUser = exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const handleImages_1 = require("../../utils/handleImages");
const sendEmails_1 = require("../../utils/sendEmails");
const getAllUsers = async (req, res) => {
    const allUsers = await db_1.db.select().from(schema_1.users);
    (0, response_1.SuccessResponse)(res, { users: allUsers }, 200);
};
exports.getAllUsers = getAllUsers;
const getUser = async (req, res) => {
    const id = req.params.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    (0, response_1.SuccessResponse)(res, user, 200);
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    const id = req.params.id;
    const newUser = req.body;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (newUser.password) {
        newUser.hashedPassword = await bcrypt_1.default.hash(newUser.password, 10);
        delete newUser.password;
    }
    if (newUser.imageBase64) {
        newUser.imagePath = (0, handleImages_1.saveBase64Image)(newUser.imageBase64, id);
    }
    const result = await db_1.db.update(schema_1.users).set(newUser).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    (0, response_1.SuccessResponse)(res, { message: "User Updated successfully" }, 200);
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const id = req.params.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    (0, response_1.SuccessResponse)(res, { message: "User deleted successfully" }, 200);
};
exports.deleteUser = deleteUser;
const approveUser = async (req, res) => {
    const id = req.params.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const result = await db_1.db
        .update(schema_1.users)
        .set({
        status: "approved",
        updatedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    await (0, sendEmails_1.sendEmail)(user.email, "Your account has been approved", "Congratulations! Your account has been approved by the admin. You can now log in and start using our services.");
    (0, response_1.SuccessResponse)(res, { message: "User approved successfully" }, 200);
};
exports.approveUser = approveUser;
const rejectUser = async (req, res) => {
    const id = req.params.id;
    const { rejectionReason } = req.body;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const result = await db_1.db
        .update(schema_1.users)
        .set({
        status: "rejected",
        updatedAt: new Date(),
        rejectionReason: rejectionReason,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    await (0, sendEmails_1.sendEmail)(user.email, "Your account has been Rejected", "Unfortunately, your account was rejected.");
    (0, response_1.SuccessResponse)(res, { message: "User rejected successfully" }, 200);
};
exports.rejectUser = rejectUser;
const getAllRejectedUsers = async (req, res) => {
    const allRejectedUsers = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.status, "rejected"));
    (0, response_1.SuccessResponse)(res, { users: allRejectedUsers }, 200);
};
exports.getAllRejectedUsers = getAllRejectedUsers;
const getAllPendingUsers = async (req, res) => {
    const allRejectedUsers = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.status, "pending"));
    (0, response_1.SuccessResponse)(res, { users: allRejectedUsers }, 200);
};
exports.getAllPendingUsers = getAllPendingUsers;
