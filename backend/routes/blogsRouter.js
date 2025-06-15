import express from "express";
import {
  getAllBlogs,
  postBlog,
  // deleteBlog,
  // getSingleBlog,
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
// router.get("/:id", getSingleBlog);

export default router;
