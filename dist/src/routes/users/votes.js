"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const votes_1 = require("../../controllers/users/votes");
const validation_1 = require("../../middlewares/validation");
const catchAsync_1 = require("../../utils/catchAsync");
const votes_2 = require("../../validators/users/votes");
const router = (0, express_1.Router)();
router.get("/", (0, catchAsync_1.catchAsync)(votes_1.getAllVotes));
router.get("/:id/result", (0, catchAsync_1.catchAsync)(votes_1.voteResult));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(votes_1.getVote))
    .post((0, validation_1.validate)(votes_2.submitVoteSchema), (0, catchAsync_1.catchAsync)(votes_1.submitVote));
exports.default = router;
