"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../../controllers/admin/users");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const users_2 = require("../../validators/admin/users");
const auth_1 = require("../../validators/users/auth");
const auth_2 = require("../../controllers/users/auth");
const router = (0, express_1.Router)();
router
    .route("/")
    .get((0, catchAsync_1.catchAsync)(users_1.getAllUsers))
    .post((0, validation_1.validate)(auth_1.signupSchema), (0, catchAsync_1.catchAsync)(auth_2.signup));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(users_1.getUser))
    .delete((0, catchAsync_1.catchAsync)(users_1.deleteUser))
    .put((0, validation_1.validate)(users_2.updateUserSchema), (0, catchAsync_1.catchAsync)(users_1.updateUser));
router.put("/:id/approve", (0, catchAsync_1.catchAsync)(users_1.approveUser));
router.put("/:id/reject", (0, catchAsync_1.catchAsync)(users_1.rejectUser));
// Rejected User
router.get("/rejected", (0, catchAsync_1.catchAsync)(users_1.getAllRejectedUsers));
router
    .route("/rejected/:id")
    .get((0, catchAsync_1.catchAsync)(users_1.getUser))
    .put((0, catchAsync_1.catchAsync)(users_1.updateUser))
    .delete((0, catchAsync_1.catchAsync)(users_1.deleteUser));
// Pending User
router.get("/Pending", (0, catchAsync_1.catchAsync)(users_1.getAllPendingUsers));
exports.default = router;
