import express from "express";
import {
  getAllBlogs,
  postBlog,
  deleteBlog,
  getDetailBlog,
  checkBlogQuality,
} from "../controllers/blogsController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/multer.js";

const router = express.Router();

router.get("/getallblogs", isAuthenticated, getAllBlogs);
router.post(
  "/postblog",
  isAuthenticated,
  uploadImage.single("image"),
  postBlog
);
router.delete("/deleteblog/:id", isAuthenticated, deleteBlog);
router.get("/:id", isAuthenticated, getDetailBlog);
router.post("/check-blog-quality", isAuthenticated, checkBlogQuality);

export default router;
