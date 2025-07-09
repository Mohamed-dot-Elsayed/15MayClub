"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_1 = require("../../controllers/admin/complaints");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.route("/").get((0, catchAsync_1.catchAsync)(complaints_1.getAllComplaints));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(complaints_1.getComplaint))
    .put((0, catchAsync_1.catchAsync)(complaints_1.makeComplaintSeen))
    .delete((0, catchAsync_1.catchAsync)(complaints_1.deleteComplaint));
router.post("/:id/status", (0, catchAsync_1.catchAsync)(complaints_1.changeComplaintStatus));
exports.default = router;
