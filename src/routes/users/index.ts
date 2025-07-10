import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import ProfileRoute from "./Profile";
import AuthRoute from "./auth";
import ComplaintsRoute from "./complaints";
import CompetitionsRoute from "./competitions";
import { Router } from "express";
import multer from "multer";
const upload = multer();
const route = Router();
route.use(upload.none());
route.use("/auth", AuthRoute);
route.use(
  authenticated,
  authorizeRoles("approved_member_user", "approved_guest_user")
);
route.use("/complaints", ComplaintsRoute);
route.use("/profile", ProfileRoute);
route.use("/complaints", ComplaintsRoute);
route.use("/competitions", CompetitionsRoute);
export default route;
