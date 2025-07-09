"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authenticated_1 = require("../../middlewares/authenticated");
const authorized_1 = require("../../middlewares/authorized");
const auth_1 = __importDefault(require("./auth"));
const complaints_1 = __importDefault(require("./complaints"));
const competitions_1 = __importDefault(require("./competitions"));
const express_1 = require("express");
const route = (0, express_1.Router)();
route.use("/auth", auth_1.default);
route.use(authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("approved_member_user", "approved_guest_user"));
route.use("/complaints", complaints_1.default);
route.use("/competitions", competitions_1.default);
exports.default = route;
