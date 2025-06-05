import multer from "multer";

// Store file in memory as Buffer (not disk)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // console.log("✅ Inside multer fileFilter");
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
    // console.log("⛔ Leaving multer filter");
  },
});
