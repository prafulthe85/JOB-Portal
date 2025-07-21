import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import toast from "react-hot-toast";
import "./BlogDetails.scss";
import Sidebar from "../Sidebar/Sidebar";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [qualityData, setQualityData] = useState(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [delayContent, setDelayContent] = useState(false);

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

  const handleQuality = async () => {
    try {
      if (qualityData) {
        setOpenSidebar(true);
        setTimeout(() => {
          setDelayContent(true); // show after 1s
        }, 1000);
        return;
      }
      setOpenSidebar(true);
      setQualityLoading(true);
      // setQualityData(null);

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/blogs/check-blog-quality`,
        { blogId: id },
        {
          withCredentials: true,
        }
      );
      console.log("res", res);

      const { score, suggestions } = res.data;
      if (!score || !suggestions) throw new Error("No reply from backend");

      setQualityData({ score, suggestions });
      // setOpenSidebar(true);
      setQualityLoading(false);
      setTimeout(() => {
        setDelayContent(true);
      }, 1000);
      // setLoadingQuality(false);
      console.log("✅ Blog quality result:", { score, suggestions });
    } catch (err) {
      console.error("❌ Error checking blog quality:", err);
      toast.error("Failed to generate job details. Please try again.");
      setQualityLoading(false);
      // setShowTooltip(false);
      // setLoadingQuality(false);
    }
  };

  return (
    <div className="blog-details-page">
      <div className="blog-details-container">
        <h1>{blog.title}</h1>
        <button
          className="quality-chip-detail"
          onClick={handleQuality}
          disabled={openSidebar}
        >
          Generate Feedback
        </button>
        <p className="meta">
          <strong>By:</strong> {blog.name} | <strong>Category:</strong>{" "}
          {blog.category} | {new Date(blog.createdAt).toLocaleString()}
        </p>
        <p className="blog-content">{blog.content}</p>
      </div>
      <Sidebar
        open={openSidebar}
        onClose={() => {
          setOpenSidebar(false);
          setDelayContent(false);
        }} // clicking outside or >> closes
        score={qualityData?.score}
        suggestions={qualityData?.suggestions}
        loading={qualityLoading || !delayContent}
      />
    </div>
  );
};

export default BlogDetails;
