import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";
import axios from "axios";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { title, description, category, country, city, location, salary } =
    req.body;

  if (
    !title ||
    !description ||
    !category ||
    !country ||
    !city ||
    !location ||
    !salary
  ) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    salary,
    postedBy,
  });
  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Job Updated!",
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted!",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  }
});

export const generateAIJobDetails = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { aiPrompt } = req.body;

  if (!aiPrompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `You are an intelligent job data generator.

                Given a free-form text that describes a job, generate a structured JSON object with the following fields:

                {
                  "title": "Job title",
                  "category": "Job category ",
                  "country": "Country name",
                  "city": "City name",
                  "location": "Full location (City + Country)",
                  "salary": "Salary range or amount",
                  "description": {
                    "requirement": "Write 2-3 sentences describing the top requirements of the job. Use a natural tone, not bullet points.",
                    "experience": "Write the experience needed for this role in a short sentence.",
                    "skills": "Write 3-4 sentences explaining the important skills needed for the job. Mention technologies, tools, and soft skills.",
                    "responsibility": "Write 3-4 sentences detailing the key responsibilities in this role. Describe daily tasks and what the person will be expected to deliver."
                  }
                }

                Rules:
                - Output must be ONLY in JSON format.
                - If any detail is missing in the input, make a reasonable assumption based on the job context.
                - Do not include explanations or text outside the JSON.
                - **For "category", if possible, pick a value from the following list**:
                  - Graphics & Design
                  - Mobile App Development
                  - Frontend Web Development
                  - Backend Web Development
                  - Account & Finance
                  - Artificial Intelligence
                  - Video Animation
                  - Software Engineer
                  - DevOps Engineer

                Now based on this job description: ${aiPrompt}`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VITE_OPEN_ROUTER_KEY}`,
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ message: "No response from AI" });
    }

    return res.status(200).json({ content: reply });
  } catch (error) {
    console.error("OpenRouter error:", error.message);
    return res.status(500).json({ message: "AI generation failed" });
  }
});
