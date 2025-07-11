"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const popUps_1 = require("../../controllers/users/popUps");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.route("/:pageName").get((0, catchAsync_1.catchAsync)(popUps_1.getActivePopUpsForPage));
exports.default = router;
