import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  downloadResume,
  checkAtsScore,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/post", isAuthenticated, upload.single("resume"), postApplication);
router.get("/download/:id", isAuthenticated, downloadResume);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.post(
  "/ats/match",
  isAuthenticated,
  upload.single("resume"),
  checkAtsScore
);

export default router;
