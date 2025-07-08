import { Router } from "express";
import {
  getVote,
  getAllVotes,
  createVote,
  deleteVote,
  updateVote,
  getOptions,
  createOption,
} from "../../controllers/admin/votes";
import { validate } from "../../middlewares/validation";
import { catchAsync } from "../../utils/catchAsync";
import {
  createFullVoteSchema,
  updateVoteSchema,
} from "../../validators/admin/votes";
const router = Router();
router.post("/", validate(createFullVoteSchema), catchAsync(createVote));
router.get("/", catchAsync(getAllVotes));
router
  .route("/:id")
  .get(catchAsync(getVote))
  .put(validate(updateVoteSchema), catchAsync(updateVote))
  .delete(catchAsync(deleteVote));

router
  .route("/:voteId/items")
  .get(catchAsync(getOptions))
  .post(catchAsync(createOption));

router.delete("/items/:itemId", catchAsync(deleteVote));

export default router;
