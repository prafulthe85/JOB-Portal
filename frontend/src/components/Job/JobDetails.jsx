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
        setJob(res.data.job);
        setIsLoading(false);
      })
      .catch((error) => {
        navigateTo("/notfound");
      });
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  if (isLoading) {
    return <Loader />;
  }

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
            <Link to={`/application/${job._id}`} className="apply-btn">
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetails;
