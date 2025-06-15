import mongoose from "mongoose";
import validator from "validator";

const blogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required!"],
      minLength: [5, "Title must be at least 5 characters long"],
    },

    category: {
      type: String,
      required: [true, "Please select a category!"],
      enum: ["IT", "movies", "jobupdates", "market scenarios"],
    },

    content: {
      type: String,
      required: [true, "Please provide blog content!"],
      minLength: [50, "Content must be at least 50 characters long"],
    },

    image: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    name: {
      type: String,
      required: [true, "Author name is required!"],
    },

    email: {
      type: String,
      required: [true, "Author email is required!"],
      validate: [validator.isEmail, "Please provide a valid Email!"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔗 links to the User model
      required: true,
    },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt automatically
  }
);

export const Blogs = mongoose.model("Blogs", blogsSchema);
