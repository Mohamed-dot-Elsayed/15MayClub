import { Router } from "express";
import {
  getVote,
  getAllVotes,
  createVote,
  deleteVote,
  updateVote,
  getAllOptions,
  getOption,
  updateOptions,
  deleteOption,
  getVoteResult,
} from "../../controllers/admin/votes";
import { validate } from "../../middlewares/validation";
import { catchAsync } from "../../utils/catchAsync";
import {
  createFullVoteSchema,
  flexibleVoteItemsSchema,
  updateVoteSchema,
} from "../../validators/admin/votes";
const router = Router();

// Create Vote and get all votes
router.post("/", validate(createFullVoteSchema), catchAsync(createVote));
router.get("/", catchAsync(getAllVotes));

// Get All options, Edit and delete option
router
  .route("/:voteId/items")
  .get(catchAsync(getAllOptions))
  .put(validate(flexibleVoteItemsSchema), catchAsync(updateOptions));

// Get option by id and delete option
router
  .route("/items/:itemId")
  .get(catchAsync(getOption))
  .delete(catchAsync(deleteOption));

// Get vote result
router.get("/:id/result", catchAsync(getVoteResult));

// Get, Edit and delete vote
router
  .route("/:id")
  .get(catchAsync(getVote))
  .put(validate(updateVoteSchema), catchAsync(updateVote))
  .delete(catchAsync(deleteVote));

export default router;
