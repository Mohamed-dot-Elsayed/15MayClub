"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const popUps_1 = require("../../controllers/admin/popUps");
const validation_1 = require("../../middlewares/validation");
const catchAsync_1 = require("../../utils/catchAsync");
const popUps_2 = require("../../validators/admin/popUps");
const router = (0, express_1.Router)();
router
    .route("/")
    .post((0, validation_1.validate)(popUps_2.createPopUpSchema), (0, catchAsync_1.catchAsync)(popUps_1.createPopUp))
    .get((0, catchAsync_1.catchAsync)(popUps_1.getAllPopUps));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(popUps_1.getPopUpById))
    .delete((0, catchAsync_1.catchAsync)(popUps_1.deletePopUp))
    .put((0, validation_1.validate)(popUps_2.updatePopUpSchema), (0, catchAsync_1.catchAsync)(popUps_1.updatePopUp));
exports.default = router;
