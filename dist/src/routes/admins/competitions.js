"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competitions_1 = require("../../controllers/admin/competitions");
const competitions_2 = require("../../validators/admin/competitions");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const router = (0, express_1.Router)();
router
    .route("/")
    .get((0, catchAsync_1.catchAsync)(competitions_1.getAllCompetitions))
    .post((0, validation_1.validate)(competitions_2.createCompetitionSchema), (0, catchAsync_1.catchAsync)(competitions_1.createCompetition));
router.delete("/:id/users/:userId", (0, validation_1.validate)(competitions_2.removeUserSchema), (0, catchAsync_1.catchAsync)(competitions_1.removeCompetitionUser));
router.delete("/:id/users/:userId", (0, catchAsync_1.catchAsync)(competitions_1.removeCompetitionUser));
router.get("/:id/users", (0, catchAsync_1.catchAsync)(competitions_1.getCompetitionUsers));
router.get("/:id/images", (0, catchAsync_1.catchAsync)(competitions_1.getCompetitionImages));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(competitions_1.getCompetition))
    .delete((0, catchAsync_1.catchAsync)(competitions_1.deleteCompetition))
    .put((0, validation_1.validate)(competitions_2.updateCompetitionSchema), (0, catchAsync_1.catchAsync)(competitions_1.updateCompetition));
exports.default = router;
