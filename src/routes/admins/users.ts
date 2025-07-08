import { Router } from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
} from "../../controllers/admin/users";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { updateUserSchema } from "../../validators/admin/users";
import { signupSchema } from "../../validators/users/auth";
import { signup } from "../../controllers/users/auth";
const router = Router();

router
  .route("/")
  .get(catchAsync(getAllUsers))
  .post(validate(signupSchema), catchAsync(signup));
router
  .route("/:id")
  .get(catchAsync(getUser))
  .delete(catchAsync(deleteUser))
  .put(validate(updateUserSchema), catchAsync(updateUser));
router.put("/:id/approve", catchAsync(approveUser));
router.put("/:id/reject", catchAsync(rejectUser));

export default router;
