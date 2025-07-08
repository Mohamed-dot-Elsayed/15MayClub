import { Router } from "express";
import { validate } from "../../middlewares/validation";
import { catchAsync } from "../../utils/catchAsync";
import { createComplaints } from "../../controllers/users/complaints";
import { createComplaintSchema } from "../../validators/users/complaints";
const router = Router();
router.post("/", validate(createComplaintSchema), catchAsync(createComplaints));
export default router;
