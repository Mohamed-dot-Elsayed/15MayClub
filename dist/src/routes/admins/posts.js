"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_1 = require("../../controllers/admin/posts");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .route("/categories")
    .get((0, catchAsync_1.catchAsync)(posts_1.getAllCategories))
    .post((0, catchAsync_1.catchAsync)(posts_1.createCategory));
router
    .route("/categories/:id")
    .get((0, catchAsync_1.catchAsync)(posts_1.getCategory))
    .put((0, catchAsync_1.catchAsync)(posts_1.updateCategory))
    .delete((0, catchAsync_1.catchAsync)(posts_1.deleteCategory));
router.route("/").get((0, catchAsync_1.catchAsync)(posts_1.getAllPosts)).post((0, catchAsync_1.catchAsync)(posts_1.createPost));
router
    .route("/:id")
    .get((0, catchAsync_1.catchAsync)(posts_1.getPost))
    .delete((0, catchAsync_1.catchAsync)(posts_1.deletePost))
    .put((0, catchAsync_1.catchAsync)(posts_1.updatePost));
exports.default = router;
