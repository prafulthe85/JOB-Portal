// src/components/Card.jsx
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import "./Card.scss"; // import styles if any

const Card = ({ blog, onDeleteClick }) => {
  const navigate = useNavigate();
  const imageUrl =
    blog.image || `https://picsum.photos/300/180?random=${blog._id}`;

  const [showTooltip, setShowTooltip] = useState(false);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [qualityData, setQualityData] = useState(null);

  const handleDelete = async () => {
    console.log("inside deleteblog", blog._id);
    await axios
      .delete(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/deleteblog/${
          blog._id
        }`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("res in deleteblog", res);
        toast.success(res.data.message);
        if (onDelete) onDelete();
      })
      .catch((error) => {
        console.log("error in deleteblog", error);
        toast.error(error.response.data.message);
      });
  };

  const handleQuality = async () => {
    try {
      setShowTooltip(true);
      setLoadingQuality(true);

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/check-blog-quality`,
        { blogId: blog._id },
        {
          withCredentials: true,
        }
      );

      const { score, suggestions } = res.data;
      setQualityData({ score, suggestions });
      setLoadingQuality(false);
      console.log("✅ Blog quality result:", { score, suggestions });
      if (!score || !suggestions) throw new Error("No reply from backend");
    } catch (err) {
      console.error("❌ Error checking blog quality:", err);
      toast.error("Failed to generate job details. Please try again.");
      setShowTooltip(false);
      setLoadingQuality(false);
    }
  };

  return (
    <div className="card">
      <div className="card__left">
        <h2 className="card__title">{blog.title}</h2>
        <p className="card__description">
          This is a short description of the blog. Learn more about this topic
          blog. Learn more about this topic by clicking below.
        </p>

        <p className="card__meta">
          Category: <strong>{blog.category}</strong> <br />
          By: <strong>{blog.email}</strong> <br />
          On: <strong>{format(new Date(blog.createdAt), "dd MMM yyyy")}</strong>
        </p>

        <div className="button_outer">
          <button
            className="read-more-btn"
            onClick={() => navigate(`/blogs/${blog._id}`)}
          >
            Read Blog
          </button>

          {blog.isAuthor && (
            <button
              className="delete-chip"
              onClick={() => {
                onDeleteClick(blog);
              }}
            >
              Delete
            </button>
          )}

          <div className="quality-chip-outer">
            <button className="quality-chip" onClick={handleQuality}>
              Check Blog Quality
            </button>

            {showTooltip && (
              <div className="quality-tooltip">
                <span
                  className="close-tooltip"
                  onClick={() => setShowTooltip(false)}
                >
                  ×
                </span>

                {loadingQuality ? (
                  <div className="skeleton">
                    <div className="skeleton-line top-skeleton" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                ) : (
                  <div>
                    <h3 className="quality-title">
                      Your Blog Quality:
                      <span className="quality-score">
                        {qualityData?.score}/100
                      </span>
                    </h3>

                    <p className="suggestions-note">
                      Click on <strong>Read Blog</strong> to see suggestions to
                      improve blog quality.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card__image">
        <img src={imageUrl} alt={blog.title} className="card-img" />
      </div>
    </div>
  );
};

export default Card;
