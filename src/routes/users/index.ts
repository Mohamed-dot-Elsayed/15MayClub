import AuthRoute from "./auth";
import { Router } from "express";
const route = Router();
route.use("/auth", AuthRoute);
export default route;
