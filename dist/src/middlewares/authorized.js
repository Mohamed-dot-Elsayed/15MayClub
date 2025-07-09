"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const Errors_1 = require("../Errors");
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new Errors_1.UnauthorizedError();
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
