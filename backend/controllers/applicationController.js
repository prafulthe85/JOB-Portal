import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { getAIQualityFeedback } from "../utils/openRouter.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
// import { getCache, setCache } from "./redisClient.js";
import axios from "axios";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }

  const resume = req.file;

  if (!resume || !resume.buffer) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  // console.log(`Resume mimetype ${resume.mimetype}`);

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      data: resume.buffer,
      contentType: resume.mimetype,
      fileName: resume.originalname,
    },
  });
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({
      "applicantID.user": _id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const downloadResume = catchAsyncErrors(async (req, res, next) => {
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);

  // console.log("application", application);
  if (!application || !application.resume || !application.resume.data) {
    return next(new ErrorHandler("Resume not found!", 404));
  }

  const fileBuffer = Buffer.from(application.resume.data);

  res.set({
    "Access-Control-Expose-Headers": "Content-Disposition",
    "Content-Type": application.resume.contentType,
    "Content-Disposition": `attachment; filename="${
      application.resume.fileName || "resume.pdf"
    }"`,
  });

  res.send(fileBuffer);
});

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

export const checkAtsScore = catchAsyncErrors(async (req, res, next) => {
  const { title, description, location, salary, applicationId } = req.body;
  console.log("req.body", req.body);
  if (!title || !description || !location || !salary) {
    return res.status(400).json({
      success: false,
      message: "All job fields are required.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Resume file is required.",
    });
  }

  // console.log("userId", req.user);
  // const userId = req.user?._id.toString();

  // const cacheKey = `ats:${userId}:${applicationId}`;
  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   console.log("Returning data from cache");
  //   return res.status(200).json({ ...cached, cached: true });
  // }

  let resumeText = "";

  // Extract text from PDF
  if (req.file.mimetype === "application/pdf") {
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    resumeText = pdfData.text;
  }

  // Extract text from DOCX
  else if (
    req.file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    resumeText = result.value;
  } else {
    return res.status(400).json({
      success: false,
      message: "Only PDF or DOCX resumes allowed.",
    });
  }

  const prompt = `
    I will give you a job description and a resume text. 
    You need to compare them and return ATS score strictly in JSON only.

    Job Title: ${title}
    Job Description: ${description}
    Job Location: ${location}
    Job Salary: ${salary}

    Resume Text: 
    ${resumeText}

    Now analyze both and respond ONLY in the following JSON format:

    {
      "score": number,
      "total": 100(give me score out of 100),
      "feedback": [
        "Add at least 4 detailed feedback points based on resume-job match"
      ]
    }
  `;

  const llmResponse = await getAIQualityFeedback(prompt);
  console.log("✅ LLM response:", llmResponse);

  if (llmResponse.status !== 200) {
    return res
      .status(500)
      .json({ success: false, message: llmResponse.message });
  }

  const dataFromLlm = llmResponse.parsed || {
    score: 0,
    total: 100,
    feedback: [],
  };

  if (dataFromLlm.score && dataFromLlm.feedback && dataFromLlm.total) {
    const atsResult = {
      score: dataFromLlm.score || 0,
      total: dataFromLlm.total || 100,
      feedback: dataFromLlm.feedback || [],
    };
    // await setCache(cacheKey, atsResult, 60);
    return res.status(200).json({
      success: true,
      ...atsResult,
      cached: false,
    });
  } else {
    return res.status(200).json({
      success: true,
      score: 0,
      feedback: [],
      total: 100,
    });
  }
});
