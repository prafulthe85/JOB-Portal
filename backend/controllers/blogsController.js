import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Blogs } from "../models/blogsSchema.js";
import ErrorHandler from "../middlewares/error.js";

// export const getAllBlogs = catchAsyncErrors(async (req, res, next) => {
//   const blogs = await Blogs.find();
//   res.status(200).json({
//     success: true,
//     blogs,
//   });
// });

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
      .populate("postedBy", "name email") // assumes postedBy refers to User
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
        isAuthor, // 👈 flag added
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
    const { title, category, name, email, content } = req.body;

    if (!title || !category || !content || !name || !email) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (!req.file) {
      return next(new ErrorHandler("Image is required!", 400));
    }

    const blog = await Blogs.create({
      title,
      category,
      name,
      email,
      content,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      },
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

export const evaluateBlog = async (req, res) => {
  const { title, content } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o", // or any other model
        messages: [
          {
            role: "system",
            content:
              "You are a blog evaluator. Score the blog from 0 to 100 based on quality, relevance, grammar, and clarity. Respond in JSON: { score: number, feedback: string }",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com", // optional, but some APIs require it
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    const parsed = JSON.parse(reply);

    res.status(200).json({
      success: true,
      score: parsed.score,
      feedback: parsed.feedback,
    });
  } catch (error) {
    console.error("Error evaluating blog:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate blog",
    });
  }
};

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
