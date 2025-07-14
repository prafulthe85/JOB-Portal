import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Blogs } from "../models/blogsSchema.js";
import ErrorHandler from "../middlewares/error.js";
import axios from "axios";

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
    const { title, description, category, name, email, content } = req.body;

    if (!title || !description || !category || !content || !name || !email) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    // if (!req.file) {
    //   return next(new ErrorHandler("Image is required!", 400));
    // }

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

// export const evaluateBlog = async (req, res) => {
//   const { title, content } = req.body;

//   try {
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "openai/gpt-4o", // or any other model
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a blog evaluator. Score the blog from 0 to 100 based on quality, relevance, grammar, and clarity. Respond in JSON: { score: number, feedback: string }",
//           },
//           {
//             role: "user",
//             content: `Title: ${title}\n\nContent: ${content}`,
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//           "HTTP-Referer": "https://yourdomain.com", // optional, but some APIs require it
//         },
//       }
//     );

//     const reply = response.data.choices[0].message.content;
//     const parsed = JSON.parse(reply);

//     res.status(200).json({
//       success: true,
//       score: parsed.score,
//       feedback: parsed.feedback,
//     });
//   } catch (error) {
//     console.error("Error evaluating blog:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to evaluate blog",
//     });
//   }
// };

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

    // const prompt = `
    //   You are an expert content quality analyst. Review the following blog post and provide a quality score (0-100) and 2-3 actionable improvement suggestions:

    //   Title: ${title}
    //   Description: ${description}
    //   Category: ${category}
    //   Content: ${content}

    //   Rules:
    //   - generate a structured JSON object with the following fields:
    //     {
    //       "score": number,
    //       "suggestions": [
    //         "Suggestion 1",
    //         "Suggestion 2",
    //         "Suggestion 3"
    //       ]
    //     }
    // `;

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

    // 3. Call LLM API (dummy here)
    const llmResponse = await getAIQualityFeedback(prompt);

    if (llmResponse.status === 200) {
      const rawContent = llmResponse.content;
      console.log("✅ LLM response:", llmResponse);

      const fixedJson = rawContent
        .replace(/^```json/, "") // remove markdown json wrapper
        .replace(/```$/, "") // remove trailing ```
        .replace(/\\n/g, "") // remove escaped newlines
        .replace(/\\"/g, '"') // fix escaped quotes
        .replace(/“|”/g, '"'); // fix smart quotes

      let parsed;
      try {
        parsed = JSON.parse(fixedJson);
      } catch (err) {
        console.error("❌ JSON Parse Failed:", err.message);
        console.error("🔍 Raw JSON that failed:", fixedJson);
        return res
          .status(500)
          .json({ message: "Failed to parse LLM response" });
      }

      return res.status(200).json({
        success: true,
        score: parsed.score,
        suggestions: parsed.suggestions,
      });
    } else {
      console.error("❌ LLM response error:", llmResponse);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
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

const getAIQualityFeedback = async (prompt) => {
  // Replace this with actual LLM API call
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: prompt,
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

    if (response.status === 200) {
      const reply = response.data?.choices?.[0]?.message?.content;
      console.log("✅ AI reply:", reply);
      return {
        content: reply,
        status: 200,
        message: "AI successfully generated quality feedback",
      };
    } else {
      console.error("❌ AI responded with non-200 status:", response.status);

      return {
        content: "",
        status: 500,
        message: "Failed to get quality feedback from AI",
        score: 0,
        suggestions: [],
      };
    }
  } catch (error) {
    console.error("OpenRouter error:", error.message);
    return {
      message: "AI generation failed",
      status: 500,
      score: 0,
      suggestions: [],
    };
  }

  // if (!reply) {
  //   return res.status(500).json({ message: "No response from AI" });
  // }
};
