import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/profile";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { authenticated } from "../../middlewares/authenticated";
const route = Router();

route.get("/profile", authenticated, catchAsync(getProfile));
// route.post("/profile", authenticated,validate(), catchAsync(updateProfile));

export default route;
