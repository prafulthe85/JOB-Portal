import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./BlogDetails.scss";
import Loader from "../Loader";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log("Inside the fetchblogs");
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/${id}`,
          {
            withCredentials: true,
          }
        );
        const data = res.data;
        setBlog(data.blog);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch blog", err);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="blog-details-page">
      <div className="blog-details-container">
        <h1>{blog.title}</h1>
        <p className="meta">
          <strong>By:</strong> {blog.name} | <strong>Category:</strong>{" "}
          {blog.category} | {new Date(blog.createdAt).toLocaleString()}
        </p>
        <p className="blog-content">{blog.content}</p>
      </div>
    </div>
  );
};

export default BlogDetails;
