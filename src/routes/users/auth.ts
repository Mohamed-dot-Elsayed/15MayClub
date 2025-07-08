import { Router } from "express";
import { signup, login } from "../../controllers/users/auth";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { loginSchema, signupSchema } from "../../validators/users/auth";

const route = Router();

route.post("/signup", validate(signupSchema), catchAsync(signup));
route.post("/login", validate(loginSchema), catchAsync(login));
export default route;
