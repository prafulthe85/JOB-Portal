// src/components/Card.jsx
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import "./Card.scss"; // import styles if any

const Card = ({ blog, index = 0, onDeleteClick }) => {
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
    if (qualityData) {
      setShowTooltip((prev) => !prev);
      return;
    }
    if (loadingQuality) return;

    try {
      setShowTooltip(true);
      setLoadingQuality(true);

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/check-blog-quality`,
        { blogId: blog._id },
        { withCredentials: true }
      );

      const { score, suggestions } = res.data;
      if (!score || !suggestions) throw new Error("No reply from backend");
      setQualityData({ score, suggestions });
    } catch (err) {
      console.error("Error checking blog quality:", err);
      toast.error("Failed to check content score. Please try again.");
      setShowTooltip(false);
    } finally {
      setLoadingQuality(false);
    }
  };

  return (
    <div className="blog-card" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="card__image">
        <img src={imageUrl} alt={blog.title} className="card-img" />
      </div>
      <div className="card__left">
        <h2 className="card__title">{blog.title}</h2>
        <p className="card__description">
          {blog.description || "Learn more about this topic by clicking below."}
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
              Get Content Score
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
    </div>
  );
};

export default Card;
