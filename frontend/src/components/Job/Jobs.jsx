import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import Loader from "../Loader";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call or any async operation
    setTimeout(() => {
      setIsLoading(false); // Set loading to false once the data has been fetched
    }, 500); // Adjust the timeout as needed
  }, []);

  useEffect(() => {
    try {
      axios
        .get(`${import.meta.env.VITE_SERVER_URL}/api/v1/job/getall`, {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);
  if (!isAuthorized) {
    navigateTo("/");
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>

        <div className="jobs-wrapper">
          {jobs.jobs &&
            jobs.jobs.map((element) => (
              <div className="card" key={element._id}>
                <div className="card-header-glow"></div>

                <div className="job-details">
                  <h2>{element.title}</h2>
                  <p className="tag">{element.category}</p>
                  <p className="location">{element.country}</p>
                </div>

                <div className="job-actions">
                  <Link to={`/job/${element._id}`} className="btn-details">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
