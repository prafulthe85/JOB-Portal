import app from "./app.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";

config({ path: "./config/config.env" });

console.log(
  `cloudinary details ${process.env.CLOUDINARY_CLOUD_NAME}, ${process.env.CLOUDINARY_API_KEY}, ${process.env.CLOUDINARY_API_SECRET}`
);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at port ${PORT}`);
});
