import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import Loader from "../Loader";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);
  const handleJobPost = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/job/post`,
        {
          title,
          description,
          category,
          country,
          city,
          location,
          salary,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("res", res);
        toast.success(res.data.message);
        if (res.data.success) {
          setTitle("");
          setCategory("");
          setCountry("");
          setCity("");
          setLocation("");
          setDescription("");
          setSalary("");
          setAiPrompt("");
        }
        navigateTo("/job/me");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setIsLoading(false); // Hide the loader after the process is complete
      });
  };

  const extractJobDetailsNew = (jobDescription) => {
    try {
      const jsonStart = jobDescription.indexOf("{");
      const jsonEnd = jobDescription.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1)
        throw new Error("No JSON block found.");

      const jsonString = jobDescription.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ JSON Parsing Error:", err.message);
      return null;
    }
  };

  const handleGenerateJob = async () => {
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/job/generate-job`,
        {
          aiPrompt,
        },
        {
          withCredentials: true,
        }
      );

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to generate job details.");
        return;
      }
      const job = res.data;

      const allowedCategories = [
        "Graphics & Design",
        "Mobile App Development",
        "Frontend Web Development",
        "Backend Web Development",
        "Account & Finance",
        "Artificial Intelligence",
        "Video Animation",
        "Software Engineer",
        "DevOps Engineer",
        "Data Entry Operator",
        "Other",
      ];

      setTitle(job.title || "");
      setCountry(job.country || "");
      setCity(job.city || "");
      setLocation(job.location || "");
      setSalary(job.salary || "");
      const incomingCategory = job.category || "";

      const categoryToSet = allowedCategories.includes(incomingCategory)
        ? incomingCategory
        : "Other";

      setCategory(categoryToSet);

      if (job.description) {
        const { requirement, experience, skills, responsibility } =
          job.description;

        const formattedDescription = `Job Description:\n\n\nRequirement: ${requirement}\n\nExperience: ${experience}\n\nSkills: ${skills}\n\nResponsibility: ${responsibility}`;

        setDescription(formattedDescription);
      }

      console.log("🎯 Fields set from AI response:", job);
    } catch (err) {
      console.error("Error generating job:", err);
      toast.err("Failed to generate job details. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
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
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Graphics & Design">Graphics & Design</option>
                <option value="Mobile App Development">
                  Mobile App Development
                </option>
                <option value="Frontend Web Development">
                  Frontend Web Development
                </option>
                <option value="Backend Web Development">
                  Backend Web Development
                </option>
                <option value="Account & Finance">Account & Finance</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Video Animation">Video Animation</option>
                <option value="Software Engineer">Software Engineer</option>

                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Other">Other</option>
              </select>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
            <div className="">
              <input
                type="string"
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
    </>
  );
};

export default PostJob;
