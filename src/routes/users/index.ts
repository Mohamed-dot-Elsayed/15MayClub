import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import AuthRoute from "./auth";
import ComplaintsRoute from "./complaints";
import CompetitionsRoute from "./competitions";
import { Router } from "express";
const route = Router();
route.use("/auth", AuthRoute);
route.use(
  authenticated,
  authorizeRoles("approved_member_user", "approved_guest_user")
);
route.use("/complaints", ComplaintsRoute);
route.use("/competitions", CompetitionsRoute);
export default route;
