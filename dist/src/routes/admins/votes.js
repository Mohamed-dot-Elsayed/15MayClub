"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const votes_1 = require("../../controllers/admin/votes");
const validation_1 = require("../../middlewares/validation");
const catchAsync_1 = require("../../utils/catchAsync");
const votes_2 = require("../../validators/admin/votes");
const router = (0, express_1.Router)();
// Create Vote and get all votes
router.post("/", (0, validation_1.validate)(votes_2.createFullVoteSchema), (0, catchAsync_1.catchAsync)(votes_1.createVote));
router.get("/", (0, catchAsync_1.catchAsync)(votes_1.getAllVotes));
// Get All options, Edit and delete option
router
    .route("/:voteId/items")
    .get((0, catchAsync_1.catchAsync)(votes_1.getAllOptions))
    .put((0, validation_1.validate)(votes_2.flexibleVoteItemsSchema), (0, catchAsync_1.catchAsync)(votes_1.updateOptions));
// Get option by id and delete option
router
    .route("/items/:itemId")
    .get((0, catchAsync_1.catchAsync)(votes_1.getOption))
    .delete((0, catchAsync_1.catchAsync)(votes_1.deleteOption));
// Get, Edit and delete vote
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(votes_1.getVote))
    .put((0, validation_1.validate)(votes_2.updateVoteSchema), (0, catchAsync_1.catchAsync)(votes_1.updateVote))
    .delete((0, catchAsync_1.catchAsync)(votes_1.deleteVote));
exports.default = router;
