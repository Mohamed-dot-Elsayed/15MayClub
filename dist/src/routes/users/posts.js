"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_1 = require("../../controllers/users/posts");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.get("/:type", (0, catchAsync_1.catchAsync)(posts_1.getPostsWithReactsByCategory));
router.post("/:id", (0, catchAsync_1.catchAsync)(posts_1.reactPost));
exports.default = router;
