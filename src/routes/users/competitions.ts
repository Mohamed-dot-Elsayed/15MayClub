import { Router } from "express";
import {
  getCompetition,
  participantsCompetitions,
} from "../../controllers/users/competitions";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router
  .route("/")
  .get(catchAsync(getCompetition))
  .post(catchAsync(participantsCompetitions));
export default router;
