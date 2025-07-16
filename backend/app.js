import express from "express";
import dbConnection from "./database/dbConnection.js";
import userRouter from "./routes/userRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import blogsRouter from "./routes/blogsRouter.js";
import applicationRouter from "./routes/applicationRoutes.js";
import { config } from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { logger } from "../backend/utils/logger.js";

const app = express();
config({ path: "./config/config.env" });

console.log("🚀 Starting server with ENV variables:");
console.log("🔹 NODE_ENV:", process.env.NODE_ENV);
console.log("🔹 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log(
  "🔹 CORS Origin Used:",
  process.env.FRONTEND_URL || "https://jobportalx.netlify.app"
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://jobportalx.netlify.app",
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  logger.info(
    `Incoming request: ${req.method} ${req.url} at ${new Date().toISOString()} `
  );
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/blogs", blogsRouter);
app.use("/api/v1/application", applicationRouter);
dbConnection();

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorMiddleware);
export default app;
