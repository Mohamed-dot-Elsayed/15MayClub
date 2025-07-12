import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/users/profile";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { updateUserProfileSchema } from "../../validators/users/profile";
const route = Router();

route.get("/profile", catchAsync(getProfile));
route.post(
  "/profile",
  validate(updateUserProfileSchema),
  catchAsync(updateProfile)
);

export default route;
