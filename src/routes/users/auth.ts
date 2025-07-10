import { Router } from "express";
import {
  signup,
  login,
  getFcmToken,
  verifyEmail,
  sendResetCode,
  resetPassword,
  verifyCode,
} from "../../controllers/users/auth";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import {
  loginSchema,
  sendResetCodeSchema,
  signupSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  checkResetCodeSchema,
} from "../../validators/users/auth";

const route = Router();

route.post("/signup", validate(signupSchema), catchAsync(signup));
route.post("/login", validate(loginSchema), catchAsync(login));
route.post(
  "/verify-email",
  validate(verifyEmailSchema),
  catchAsync(verifyEmail)
);
route.post("/forgot-password", validate(sendResetCodeSchema), sendResetCode);
route.post("/verify-code", validate(checkResetCodeSchema), verifyCode);
route.post("/reset-password", validate(resetPasswordSchema), resetPassword);
route.post("/fcm-token", catchAsync(getFcmToken));
export default route;
