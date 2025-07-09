"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_1 = require("../../controllers/admin/complaints");
const complaints_2 = require("../../validators/admin/complaints");
const validation_1 = require("../../middlewares/validation");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(complaints_1.getAllComplaintsCategory)
    .post((0, validation_1.validate)(complaints_2.createCategorySchema), complaints_1.createComplaintsCategory);
router
    .route("/:id")
    .get(complaints_1.getComplaintsCategory)
    .put((0, validation_1.validate)(complaints_2.updateCategorySchema), complaints_1.updateComplaintsCategory)
    .delete(complaints_1.deleteComplaintsCategory);
exports.default = router;
