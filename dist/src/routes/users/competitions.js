"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competitions_1 = require("../../controllers/users/competitions");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const competitions_2 = require("../../validators/users/competitions");
const router = (0, express_1.Router)();
router.get("/", (0, catchAsync_1.catchAsync)(competitions_1.getAllCompetitions));
router
    .route("/:id")
    .post((0, validation_1.validate)(competitions_2.participateCompetitionSchema), (0, catchAsync_1.catchAsync)(competitions_1.participantsCompetitions))
    .get((0, catchAsync_1.catchAsync)(competitions_1.getCompetition));
exports.default = router;
