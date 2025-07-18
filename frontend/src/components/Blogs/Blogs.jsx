import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Loader from "../Loader";
import ConfirmModal from "../Modal/ConfirmModal";
import "./Blogs.scss";
import Card from "./Card/Card";

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
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // const [searchTitle, setSearchTitle] = useState(""); // actual filter trigger

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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
  useEffect(() => {
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
      !formData.description ||
      !formData.category ||
      !formData.name ||
      !formData.email ||
      !formData.content
      // !formData.image
    ) {
      return toast.error("Please fill in all fields including the image");
    }
    if (formData.content.length < 50) {
      console.log("formData.content.length: ", formData.content.length);
      return toast.error("Blog content must be at least 50 characters long");
    }
    if (formData.description.length > 200) {
      console.log("formData.description.length: ", formData.description.length);
      return toast.error(
        "Blog description must be at most 200 characters long"
      );
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
        description: "",
        category: "",
        name: "",
        email: "",
        image: null,
        content: "",
      });

      setShowPopup(false);
      toast.success("Blog posted successfully!");
      fetchBlogs();
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
        description: "",
        category: "",
        name: "",
        email: "",
        image: null,
        content: "",
      });
    }, 300); // match the transition duration
  };

  const handleDeleteClick = (blog) => {
    setDeleteBlogId(blog._id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/v1/blogs/deleteblog/${deleteBlogId}`,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setShowConfirmDelete(false);
      setDeleteBlogId(null);
      fetchBlogs(); // refresh list
    } catch (error) {
      console.log("error in deleteblog", error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
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
          {blogs.map((blog, index) => (
            <div className="blog-carddd" key={index}>
              <Card blog={blog} onDeleteClick={handleDeleteClick} />
            </div>
          ))}
        </div>
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next →
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
              <input
                type="text"
                required
                placeholder="Your blog's Description"
                name="description"
                value={formData.descrition}
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

        {showConfirmDelete && (
          <ConfirmModal
            message="Do you want to delete this JOB?"
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setShowConfirmDelete(false);
              setDeleteBlogId(null);
            }}
          />
        )}
      </div>
    </section>
  );
};

export default Blogs;
