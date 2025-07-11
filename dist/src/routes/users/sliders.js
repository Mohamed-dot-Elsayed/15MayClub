"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const sliders_1 = require("../../controllers/users/sliders");
const router = (0, express_1.Router)();
router.get("/", (0, catchAsync_1.catchAsync)(sliders_1.getActiveSliders));
exports.default = router;
