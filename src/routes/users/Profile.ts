import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/users/profile";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { authenticated } from "../../middlewares/authenticated";
import { updateUserSchema } from "../../validators/admin/users";
const route = Router();

route.get("/profile", catchAsync(getProfile));
route.post("/profile", validate(updateUserSchema), catchAsync(updateProfile));

export default route;
