import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import {
  createSlider,
  getAllSlidersForAdmin,
  getSliderById,
  updateSlider,
  deleteSlider,
} from "../../controllers/admin/sliders";
import { validate } from "../../middlewares/validation";
import {
  createSliderSchema,
  updateSliderSchema,
} from "../../validators/admin/sliders";
const router = Router();
router
  .route("/")
  .post(validate(createSliderSchema), catchAsync(createSlider))
  .get(catchAsync(getAllSlidersForAdmin));
router
  .route("/:id")
  .get(catchAsync(getSliderById))
  .put(validate(updateSliderSchema), catchAsync(updateSlider))
  .delete(catchAsync(deleteSlider));
export default router;
