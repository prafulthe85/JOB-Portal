import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import Loader from "../Loader";

const CATEGORIES = [
  "Graphics & Design",
  "Mobile App Development",
  "Frontend Web Development",
  "Backend Web Development",
  "Account & Finance",
  "Artificial Intelligence",
  "Video Animation",
  "Software Engineer",
  "DevOps Engineer",
  "Other",
];

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [salary, setSalary] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [apiErrorModal, setApiErrorModal] = useState(false);

  const dropdownRef = useRef(null);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleJobPost = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/job/post`,
        { title, description, category, country, city, companyName, salary },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        if (res.data.success) {
          setTitle("");
          setCategory("");
          setCountry("");
          setCity("");
          setCompanyName("");
          setDescription("");
          setSalary("");
          setAiPrompt("");
        }
        navigateTo("/job/me");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to post job");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGenerateJob = async () => {
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/job/generate-job`,
        { aiPrompt },
        { withCredentials: true }
      );

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to generate job details.");
        return;
      }
      const job = res.data;

      setTitle(job.title || "");
      setCountry(job.country || "");
      setCity(job.city || "");
      setCompanyName(job.companyName || "");
      setSalary(job.salary || "");

      const categoryToSet = CATEGORIES.includes(job.category || "")
        ? job.category
        : "Other";
      setCategory(categoryToSet);

      if (job.description) {
        const { requirement, experience, skills, responsibility } =
          job.description;
        const formattedDescription = `Job Description:\n\n\nRequirement: ${requirement}\n\nExperience: ${experience}\n\nSkills: ${skills}\n\nResponsibility: ${responsibility}`;
        setDescription(formattedDescription);
      }
    } catch (err) {
      console.error("Error generating job:", err);
      setApiErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="job_post page">
        <div className="container">
          <h3>POST NEW JOB</h3>
          <form onSubmit={handleJobPost}>
            <div className="aiwrapper">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Generate job details using AI"
              />
              <p>
                Example: We are hiring a experienced Frontend Developer for a
                remote role in Bangalore, India. The salary range is between
                ₹10,00,000 to ₹15,00,000.
              </p>
              <button type="button" onClick={handleGenerateJob}>
                Generate Job
              </button>
            </div>
            <div className="wrapper">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job Title"
              />
              <div className="custom-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className={`custom-dropdown-trigger${
                    dropdownOpen ? " open" : ""
                  }${!category ? " placeholder" : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {category || "Select Category"}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {dropdownOpen && (
                  <div className="custom-dropdown-menu">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        className={`custom-dropdown-option${
                          category === cat ? " selected" : ""
                        }`}
                        onClick={() => {
                          setCategory(cat);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="option-dot"></span>
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="wrapper">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
            />
            <div>
              <input
                type="text"
                id="salary"
                placeholder="Enter Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>

            <textarea
              rows="20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job Description"
            />

            <p className="ai-note">
              NOTE: Using a free ai key, which is able to generate limited
              content with less accuracy, having limited tokens
            </p>
            <button type="submit">Create Job</button>
          </form>
        </div>
      </div>

      {apiErrorModal && (
        <div className="api-error-overlay">
          <div className="api-error-modal">
            <h3>AI Generation Failed</h3>
            <p>
              The AI API key has expired or reached its usage limit. It will be
              updated shortly.
            </p>
            <button onClick={() => setApiErrorModal(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostJob;
