"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../../middlewares/validation");
const catchAsync_1 = require("../../utils/catchAsync");
const complaints_1 = require("../../controllers/users/complaints");
const complaints_2 = require("../../validators/users/complaints");
const router = (0, express_1.Router)();
router
    .route("/")
    .post((0, validation_1.validate)(complaints_2.createComplaintSchema), (0, catchAsync_1.catchAsync)(complaints_1.createComplaints))
    .get((0, catchAsync_1.catchAsync)(complaints_1.getComplaintsCategory));
exports.default = router;
