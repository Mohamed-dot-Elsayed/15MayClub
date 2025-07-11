import { Router } from "express";
import {
  getPosts,
  reactPost,
  getPostReacts,
} from "../../controllers/users/posts";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.get("/", catchAsync(getPosts));
router.route("/:id").post(catchAsync(reactPost)).get(catchAsync(getPostReacts));

export default router;
