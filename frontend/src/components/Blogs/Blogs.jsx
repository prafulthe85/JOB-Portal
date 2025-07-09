import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Loader from "../Loader";
import "./Blogs.scss";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchTitleInput, setSearchTitleInput] = useState("");
  // const [searchTitle, setSearchTitle] = useState(""); // actual filter trigger

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    name: "",
    email: "",
    image: null,
    content: "",
  });

  const navigate = useNavigate();

  // to disable the scroll when the popup of postblog is open
  useEffect(() => {
    const html = document.documentElement;
    if (showPopup) {
      document.body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      html.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      html.style.overflow = "auto";
    };
  }, [showPopup]);

  useEffect(() => {
    setPage(1); // Reset page whenever filters change
  }, [showOnlyMine, selectedCategory, searchTitle]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 5,
          ...(selectedCategory && { category: selectedCategory }),
          ...(searchTitle && { title: searchTitle }),
          ...(showOnlyMine && { showOnlyMine: "true" }),
        });
        const res = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/v1/blogs/getallblogs?${params.toString()}`,
          {
            withCredentials: true,
          }
        );
        setBlogs(res.data.blogs);
        setTotalPages(res.data.pages);
      } catch (error) {
        console.log(error);
        toast.error("Error while fetching blogs");
      } finally {
        setIsLoading(false); // ✅ Fix added
      }
    };

    fetchBlogs();
  }, [page, selectedCategory, searchTitle, showOnlyMine]);

  const handleSearch = () => {
    setPage(1); // reset to page 1
    setSearchTitle(searchTitleInput); // apply title filter
  };

  const toggleShowOnlyMine = () => {
    setPage(1); // reset to page 1
    setShowOnlyMine((prev) => !prev);
  };
  const handleCategoryChange = (e) => {
    setPage(1); // reset to page 1
    setSelectedCategory(e.target.value);
  };

  if (isLoading) {
    return <Loader />;
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePostBlog = async () => {
    if (
      !formData.title ||
      !formData.category ||
      !formData.name ||
      !formData.email ||
      !formData.content ||
      !formData.image
    ) {
      return toast.error("Please fill in all fields including the image");
    }
    if (formData.content.length < 50) {
      return toast.error("Blog content must be at least 50 characters long");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/postblog`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // 👈 important if you're using JWT in cookies
        }
      );
      setFormData({
        title: "",
        category: "",
        name: "",
        email: "",
        image: null,
        content: "",
      });

      setShowPopup(false);
      toast.success("Blog posted successfully!");
      setIsLoading(true);
      // Refresh blogs after posting
      setSearchTitle("");
      setSearchTitleInput("");
      setSelectedCategory("");
      setShowOnlyMine(false);
      setPage(1);

      // const res = await axios.get(
      //   `${
      //     import.meta.env.VITE_SERVER_URL
      //   }/api/v1/blogs/getallblogs?page=1&limit=5`,
      //   {
      //     withCredentials: true,
      //   }
      // );

      // setBlogs(res.data.blogs);
      // setTotalPages(res.data.pages);
    } catch (error) {
      console.error("Error posting blog:", error);
      toast.error("Error while posting blogs");
    } finally {
      setIsLoading(false); // Hide loader after fetching
    }
  };

  const handleClosePopup = () => {
    const backdrop = document.querySelector(".modal-backdrop");
    backdrop.classList.remove("show");

    // Wait for transition to complete before removing from DOM
    setTimeout(() => {
      setShowPopup(false);
      setFormData({
        title: "",
        category: "",
        name: "",
        email: "",
        image: null,
        content: "",
      });
    }, 300); // match the transition duration
  };

  const BlogQuality = (blog) => {
    console.log("blog: ", blog);
  };

  return (
    <section className="blogs-page page">
      <div className="blog_container">
        <div className="header">
          <h1>All Blogs</h1>
          <button className="post-button" onClick={() => setShowPopup(true)}>
            Post Your Blog
          </button>
        </div>

        <div className="filters">
          <button onClick={toggleShowOnlyMine}>
            {showOnlyMine ? "Show All Blogs" : "Show Your Blogs"}
          </button>

          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="movies">Movies</option>
            <option value="jobupdates">Job Updates</option>
            <option value="market scenarios">Market Scenarios</option>
          </select>

          <input
            type="text"
            placeholder="Search blog title"
            value={searchTitleInput}
            onChange={(e) => setSearchTitleInput(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="blogs-list">
          {blogs.map((blog) => (
            <motion.div
              key={blog._id}
              className="blog-card stylish-card"
              onClick={() => navigate(`/blogs/${blog._id}`)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
            >
              <h2>{blog.title}</h2>
              <p className="date">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="pagination">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>

        {showPopup && (
          <div className={`modal-backdrop ${showPopup ? "show" : ""}`}>
            <div className="modal-content_blog">
              <h2>Post Your Blog</h2>
              <input
                type="text"
                required
                placeholder="Your blog's title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select your category</option>
                <option value="IT">IT</option>
                <option value="movies">Movies</option>
                <option value="jobupdates">Job Updates</option>
                <option value="market scenarios">Market Scenarios</option>
              </select>
              <input
                type="text"
                placeholder="Your name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <input
                type="email"
                placeholder="Your email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input type="file" name="image" onChange={handleInputChange} />
              <textarea
                placeholder="Your blog content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
              />
              <div className="modal-actions">
                <button onClick={handlePostBlog}>Post Blog</button>
                <button onClick={handleClosePopup}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
