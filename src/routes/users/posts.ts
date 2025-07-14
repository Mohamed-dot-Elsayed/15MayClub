import { Router } from "express";
import {
  getPostsByCategory,
  reactPost,
  getPostWithReacts,
} from "../../controllers/users/posts";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.get("/:type", catchAsync(getPostsByCategory));
router.post("/:id", catchAsync(reactPost));
router.get("/:id/info", catchAsync(getPostWithReacts));

export default router;
