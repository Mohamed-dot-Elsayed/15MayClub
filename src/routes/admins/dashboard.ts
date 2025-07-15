import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { getHeader, getRejectUser } from "../../controllers/admin/dashborad";
const router = Router();
router.get("/header", catchAsync(getHeader));
router.get("/rejectUsers", catchAsync(getRejectUser));
export default router;
