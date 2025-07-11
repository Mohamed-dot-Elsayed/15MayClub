"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const sliders_1 = require("../../controllers/admin/sliders");
const validation_1 = require("../../middlewares/validation");
const sliders_2 = require("../../validators/admin/sliders");
const router = (0, express_1.Router)();
router
    .route("/")
    .post((0, validation_1.validate)(sliders_2.createSliderSchema), (0, catchAsync_1.catchAsync)(sliders_1.createSlider))
    .get((0, catchAsync_1.catchAsync)(sliders_1.getAllSlidersForAdmin));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(sliders_1.getSliderById))
    .put((0, validation_1.validate)(sliders_2.updateSliderSchema), (0, catchAsync_1.catchAsync)(sliders_1.updateSlider))
    .delete((0, catchAsync_1.catchAsync)(sliders_1.deleteSlider));
exports.default = router;
