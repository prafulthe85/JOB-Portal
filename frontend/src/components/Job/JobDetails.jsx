import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import Loader from "../Loader";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthorized, user } = useContext(Context);

  const [resumeFile, setResumeFile] = useState(null);

  const [atsLoading, setAtsLoading] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsResult, setAtsResult] = useState({
    score: 0,
    total: 0,
    feedback: [],
  });
  const [atsError, setAtsError] = useState(null);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
    }
  }, [isAuthorized, navigateTo]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job || {});
        setIsLoading(false);
      })
      .catch((error) => {
        navigateTo("/notfound");
      });
  }, [id, navigateTo]);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  if (isLoading) {
    return <Loader />;
  }

  const normalizeFeedback = (arr) => {
    const copy = Array.isArray(arr) ? [...arr] : [];
    while (copy.length < 4) copy.push("No additional feedback.");
    return copy.slice(0, 4);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setResumeFile(file);
  };

  const handleFindTheMatch = async () => {
    setAtsError(null);

    if (!resumeFile) {
      setAtsError("Please upload your resume file before checking.");
      return;
    }

    try {
      setAtsLoading(true);

      const formData = new FormData();
      formData.append("title", job.title || "");
      formData.append("applicationId", job._id || "");
      formData.append("description", job.description || "");
      formData.append(
        "location",
        job.location || `${job.city || ""}, ${job.country || ""}`
      );
      formData.append("salary", job.salary || "");

      formData.append("resume", resumeFile);

      const url = `${
        import.meta.env.VITE_SERVER_URL
      }/api/v1/application/ats/match`;

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        timeout: 120000,
      });

      if (response.status === 200 && response.data) {
        const { score = 0, total = 0, feedback = [] } = response.data;
        console.log("ATS result:", { score, total, feedback });
        setAtsResult({ score, total, feedback: normalizeFeedback(feedback) });
        setAtsModalOpen(true);
      } else {
        setAtsError("Unexpected response from ATS service.");
      }
    } catch (err) {
      console.error("ATS error:", err);
      setAtsError(
        err?.response?.data?.message ||
          "Failed to check ATS match. Try again later."
      );
    } finally {
      setAtsLoading(false);
    }
  };

  return (
    <section className="jobDetail page">
      <div className="container">
        <h3>Job Details</h3>
        <div className="banner">
          <div className="job-info">
            <p>
              <span className="job-label">Title:</span> <span>{job.title}</span>
            </p>
            <p>
              <span className="job-label">Category:</span>{" "}
              <span>{job.category}</span>
            </p>
            <p>
              <span className="job-label">Country:</span>{" "}
              <span>{job.country}</span>
            </p>
            <p>
              <span className="job-label">City:</span> <span>{job.city}</span>
            </p>
            <p>
              <span className="job-label">Location:</span>{" "}
              <span>{job.location}</span>
            </p>
            <p>
              <span className="job-label">Description:</span>{" "}
              <span>{job.description}</span>
            </p>
            <p>
              <span className="job-label">Job Posted On:</span>{" "}
              <span>{job.jobPostedOn}</span>
            </p>
            <p>
              <span className="job-label">Salary:</span> {job.salary}
            </p>
          </div>

          {user && user.role !== "Employer" && (
            <div className="resume-section">
              <label>
                <span>Upload Resume (PDF or DOCX)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />
              </label>

              <button
                onClick={handleFindTheMatch}
                disabled={atsLoading}
                className="find-match-btn"
              >
                {atsLoading ? "Checking..." : "Find the match"}
              </button>

              <p className="note">
                Check your resume ATS score based on this job
              </p>

              <Link to={`/application/${job._id}`} className="apply-btn">
                Apply Now
              </Link>

              {atsError && <p className="error-text">{atsError}</p>}
            </div>
          )}
        </div>
      </div>

      {atsModalOpen && (
        <div className="ats-modal-overlay">
          <div className="ats-modal">
            <h2>Your resume score</h2>
            <h1>
              your ats score: {atsResult.score}/{atsResult.total}
            </h1>

            <ul>
              {atsResult.feedback.map((fb, idx) => (
                <li key={idx}>{fb}</li>
              ))}
            </ul>

            <button
              className="close-btn"
              onClick={() => setAtsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobDetails;
