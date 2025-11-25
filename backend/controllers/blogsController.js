import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Blogs } from "../models/blogsSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { getAIQualityFeedback } from "../utils/openRouter.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, title, showOnlyMine } = req.query;

    const currentUserId = req.user?._id?.toString() || null;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (title) {
      query.title = { $regex: title, $options: "i" }; // case-insensitive search
    }

    if (showOnlyMine) {
      query.postedBy = currentUserId;
    }

    const total = await Blogs.countDocuments(query);
    const blogs = await Blogs.find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const blogsWithOwnership = blogs.map((blog) => {
      const isAuthor = blog.postedBy._id.toString() === currentUserId;

      return {
        _id: blog._id,
        title: blog.title,
        category: blog.category,
        content: blog.content,
        name: blog.name,
        email: blog.email,
        createdAt: blog.createdAt,
        isAuthor,
      };
    });

    res.status(200).json({
      success: true,
      page,
      total,
      pages: Math.ceil(total / limit),
      blogs: blogsWithOwnership,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

export const postBlog = async (req, res, next) => {
  try {
    const { title, description, category, name, email, content } = req.body;

    if (!title || !description || !category || !content || !name || !email) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const blog = await Blogs.create({
      title,
      description,
      category,
      name,
      email,
      content,
      // image: {
      //   data: req.file.buffer,
      //   contentType: req.file.mimetype,
      //   fileName: req.file.originalname,
      // },
      postedBy: req.user._id, // ✅ linking blog to logged-in user
    });

    res.status(201).json({
      success: true,
      message: "Blog posted successfully!",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  console.log("Inside delete blog controller");
  const blog = await Blogs.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }
  const resp = await blog.deleteOne();
  console.log("Blog deleted successfully", resp);
  res.status(200).json({
    success: true,
    message: "Blog Deleted!",
  });
});

export const getDetailBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const currentUserId = req.user?._id?.toString() || null;
    console.log("🔍 Blog ID requested:", blogId);

    const blog = await Blogs.findById(blogId).populate(
      "postedBy",
      "name email"
    );

    if (!blog) {
      console.log("❌ Blog not found for ID:", blogId);

      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const isAuthor = blog.postedBy._id.toString() === currentUserId;

    console.log("✅ Blog found:", {
      id: blog._id,
      title: blog.title,
      isAuthor,
    });

    res.status(200).json({
      success: true,
      blog: {
        _id: blog._id,
        title: blog.title,
        category: blog.category,
        content: blog.content,
        name: blog.postedBy.name,
        email: blog.postedBy.email,
        createdAt: blog.createdAt,
        isAuthor,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

export const checkBlogQuality = async (req, res) => {
  try {
    const { blogId } = req.body;

    if (!blogId) {
      return res
        .status(400)
        .json({ success: false, message: "Blog ID required" });
    }

    // 1. Fetch blog details
    const blog = await Blogs.findById(blogId).populate(
      "postedBy",
      "name email"
    );

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const { title, description, content, category } = blog;

    const prompt = `
      You are an expert and strict content quality analyst.

      Your task is to evaluate a blog post based on its title, description, category, and content. You must return your response strictly as a JSON object, with no additional explanation or comments.

      ### Blog Details:
      Title: "${title}"
      Description: "${description}"
      Category: "${category}"
      Content: "${content}"

      ### Evaluation Rules:
      - Analyze for clarity, structure, relevance, and language quality.
      - Provide a **score** between 0 and 100.
      - Suggest **2 to 3 specific improvements** in a bullet-point list.
      - Do not add any explanation outside the JSON.
      - Only return valid JSON in this format:

      {
        "score": 75,
        "suggestions": [
          "Improve the introduction by clearly stating the topic.",
          "Fix grammatical errors throughout the post.",
          "Add examples or use cases to support the points."
        ]
      }
    `;

    const llmResponse = await getAIQualityFeedback(prompt);

    if (llmResponse.status !== 200) {
        return res
          .status(500)
        .json({ success: false, message: llmResponse.message });
      }

    const dataFromLlm = llmResponse.parsed || {};
    if (dataFromLlm.score && dataFromLlm.suggestions) {
      return res.status(200).json({
        success: true,
        score: dataFromLlm.score,
        suggestions: dataFromLlm.suggestions,
      });
    } else {
      return res.status(200).json({
        success: true,
        score: 0,
        suggestions: [],
      });
    }
  } catch (error) {
    console.error("❌ Error in blog quality check:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
