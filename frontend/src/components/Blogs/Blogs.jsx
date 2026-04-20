import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../Loader";
import ConfirmModal from "../Modal/ConfirmModal";
import "./Blogs.scss";
import Card from "./Card/Card";

const BLOG_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "IT", label: "IT" },
  { value: "movies", label: "Movies" },
  { value: "jobupdates", label: "Job Updates" },
  { value: "market scenarios", label: "Market Scenarios" },
];

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
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

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
    setPage(1);
  }, [showOnlyMine, selectedCategory, searchTitle]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          <div className="blog-cat-dropdown" ref={catDropdownRef}>
            <button
              type="button"
              className={`blog-cat-trigger${catDropdownOpen ? " open" : ""}${!selectedCategory ? " placeholder" : ""}`}
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
            >
              {BLOG_CATEGORIES.find((c) => c.value === selectedCategory)?.label || "All Categories"}
              <span className="blog-cat-arrow">▼</span>
            </button>
            {catDropdownOpen && (
              <div className="blog-cat-menu">
                {BLOG_CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`blog-cat-option${selectedCategory === cat.value ? " selected" : ""}`}
                    onClick={() => {
                      handleCategoryChange({ target: { value: cat.value } });
                      setCatDropdownOpen(false);
                    }}
                  >
                    <span className="blog-cat-dot"></span>
                    {cat.label}
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <div className="blog-card-parent" key={blog._id || index}>
              <Card blog={blog} index={index} onDeleteClick={handleDeleteClick} />
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
              <p className="modal-form-subtitle">Share your thoughts with the community</p>
              <div className="modal-form-body">
                <div className="modal-field">
                  <label>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Give your blog a catchy title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-field">
                  <label>Description</label>
                  <input
                    type="text"
                    required
                    placeholder="A brief summary of your blog"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-field">
                  <label>Category</label>
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
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="modal-field">
                  <label>Cover Image</label>
                  <div className="modal-file-upload">
                    <input type="file" name="image" onChange={handleInputChange} />
                  </div>
                </div>
                <div className="modal-field">
                  <label>Content</label>
                  <textarea
                    placeholder="Write your blog content here..."
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={8}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={handlePostBlog}>Publish Blog</button>
                <button onClick={handleClosePopup}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmDelete && (
          <ConfirmModal
            message="Do you want to delete this Blog?"
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
