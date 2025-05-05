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
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    // Simulate an API call or any async operation
    setTimeout(() => {
      setIsLoading(false); // Set loading to false once the data has been fetched
    }, 500); // Adjust the timeout as needed
  }, []);
  const handleJobPost = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryFrom("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
    }
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/job/post`,
        fixedSalary.length >= 4
          ? {
              title,
              description,
              category,
              country,
              city,
              location,
              fixedSalary,
            }
          : {
              title,
              description,
              category,
              country,
              city,
              location,
              salaryFrom,
              salaryTo,
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
          setSalaryType("");
          setFixedSalary("");
          setSalaryFrom("");
          setSalaryTo("");
          setAiPrompt("");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setIsLoading(false); // Hide the loader after the process is complete
      });
  };

  const extractJobDetails = (jobDescription) => {
    const extract = (regex) => {
      const match = jobDescription.match(regex);
      return match ? match[1].trim() : "";
    };

    // Regular expression to extract the salary range with parentheses and commas
    const salaryRangeRegex = /Salary Value:\s*\(₹([\d,]+),\s*₹([\d,]+)\)/i;

    const extracted = {
      title: extract(/Job Title:\s*(.*)/i),
      category: extract(/Job Category:\s*(.*)/i),
      country: extract(/Country:\s*(.*)/i),
      city: extract(/City:\s*(.*)/i),
      location: extract(/Location:\s*(.*)/i),
      description: extract(/Job Description:\s*(.*)/i),
      requirements: extract(/Requirements:\s*(.*)/i),
      qualifications: extract(/Qualifications:\s*(.*)/i),
      experience: extract(/Experience:\s*(.*)/i),
      Responsibilities: extract(/Responsibilities:\s*(.*)/i),
      // experience: extract(/Experience:\s*(.*)/i),
    };

    let salaryType = "";
    let salaryFrom = "";
    let salaryTo = "";

    // Check if salary is in range format (with parentheses)
    const salaryRangeMatch = jobDescription.match(salaryRangeRegex);
    if (salaryRangeMatch) {
      salaryType = "Ranged Salary";
      salaryFrom = salaryRangeMatch[1].replace(/,/g, ""); // Remove commas for number format
      salaryTo = salaryRangeMatch[2].replace(/,/g, ""); // Remove commas for number format
    }

    return {
      ...extracted,
      salaryType,
      salaryFrom,
      salaryTo,
    };
  };

  const handleGenerateJob = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPEN_ROUTER_KEY}`, // replace with your key
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "user",
              // content: `Generate a job description using the following prompt: ${aiPrompt}. Also, list job title, job category, country, city, location, salary type (fixed or range), and salary value.`,
              content: `Generate a job description using the following prompt: ${aiPrompt}.
                Also, extract and list the following job details:
                - Job Title
                - Job Category (must be one of the following exactly as written: "Graphics & Design", "Mobile App Development", "Frontend Web Development", "Backedn Web Development", "Account & Finance", "Artificial Intelligence", "Video Animation", "Software Engineer", "DevOps Engineer", "Data Entry Operator". If none of these match, set the category to "Other")
                - Country
                - City
                - Location
                - Job Description 
                - qualifications
                - experience
                - requirements
                - Responsibilities
                - Salary Type: (if the "range" keyword is used in the salary description, set it to "Ranged Salary"; otherwise, set it to "Fixed Salary")
                - Salary Value: If the salary type is "Ranged Salary", provide the lower and upper salary values in the format (10,00,000, 15,00,000). For "Fixed Salary", provide the single salary value (e.g., 10,00,000).
              `,
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("🧠 AI Raw Response DATA:\n", data);
      const reply = data.choices?.[0]?.message?.content;

      if (!reply) throw new Error("No response from model");

      console.log("🧠 AI Raw Response:\n", reply);

      const jobDetails = extractJobDetails(reply);
      console.log("jobDetails", jobDetails);

      if (jobDetails?.title) setTitle(jobDetails.title);
      if (jobDetails?.category) setCategory(jobDetails.category);
      if (jobDetails?.country) setCountry(jobDetails.country);
      if (jobDetails?.city) setCity(jobDetails.city);
      if (jobDetails?.location) setLocation(jobDetails.location);
      if (jobDetails?.description) setDescription(jobDetails.description);
      if (jobDetails?.qualifications)
        setDescription(
          (prevDescription) =>
            prevDescription +
            "\n\nQualifications:\n" +
            jobDetails.qualifications
        );
      if (jobDetails?.experience)
        setDescription(
          (prevDescription) =>
            prevDescription + "\n\nExperience:\n" + jobDetails.experience
        );
      if (jobDetails?.requirements)
        setDescription(
          (prevDescription) =>
            prevDescription + "\n\rRequirements:\n" + jobDetails.requirements
        );
      if (jobDetails?.Responsibilities)
        setDescription(
          (prevDescription) =>
            prevDescription +
            "\n\rRequirements:\n" +
            jobDetails.Responsibilities
        );
    } catch (err) {
      console.error("Error generating job:", err);
      alert("Failed to generate job details. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const navigateTo = useNavigate();
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
                <option value="Backedn Web Development">
                  Backedn Web Development
                </option>
                <option value="Account & Finance">Account & Finance</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Video Animation">Video Animation</option>
                <option value="Software Engineer">Software Engineer</option>

                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Entry Operator">Data Entry Operator</option>
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
            <div className="salary_wrapper">
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
              >
                <option value="default">Select Salary Type</option>
                <option value="Fixed Salary">Fixed Salary (eg:900000)</option>
                <option value="Ranged Salary">Ranged Salary</option>
              </select>
              <div>
                {salaryType === "default" ? (
                  <p>Please provide Salary Type *</p>
                ) : salaryType === "Fixed Salary" ? (
                  <input
                    type="number"
                    placeholder="Enter Fixed Salary"
                    value={fixedSalary}
                    onChange={(e) => setFixedSalary(e.target.value)}
                  />
                ) : (
                  <div className="ranged_salary">
                    <input
                      type="number"
                      placeholder="Salary From"
                      value={salaryFrom}
                      onChange={(e) => setSalaryFrom(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Salary To"
                      value={salaryTo}
                      onChange={(e) => setSalaryTo(e.target.value)}
                    />
                  </div>
                )}
              </div>
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
