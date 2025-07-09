import express from "express";
import {
  getAllBlogs,
  postBlog,
  // deleteBlog,
  getDetailBlog,
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
// router.post("/deleteblog/:id", deleteBlog);
router.get("/:id", isAuthenticated, getDetailBlog);

export default router;
