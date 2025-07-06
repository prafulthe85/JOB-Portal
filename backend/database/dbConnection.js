import mongoose from "mongoose"; //just mongoose import!
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
dotenv.config();

//Database connection here!
const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL, {
      dbName: "Job_Portal",
    })
    .then(() => {
      //agar connect ho jaye toh!
      logger.info("MongoDB Connected Sucessfully !");
    })
    .catch((error) => {
      logger.error(`Failed to connect ${error}`);
    });
};
export default dbConnection;
