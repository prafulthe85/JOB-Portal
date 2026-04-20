import React from "react";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus } from "react-icons/fa";
import CountUp from "react-countup";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const details = [
    { id: 1, title: 123441, subTitle: "Live Jobs", icon: <FaSuitcase /> },
    { id: 2, title: 91220, subTitle: "Companies", icon: <FaBuilding /> },
    { id: 3, title: 234200, subTitle: "Job Seekers", icon: <FaUsers /> },
    { id: 4, title: 103761, subTitle: "Employers", icon: <FaUserPlus /> },
  ];

  return (
    <div className="heroSection">
      <div className="container">
        <div className="title">
          <h1>Find a job that suits</h1>
          <h1>
            your <span className="accent">interests</span> and skills
          </h1>
          <p>
            Discover thousands of job opportunities that match your skills and
            passions. Connect with top employers seeking talent like yours.
          </p>
          <Link to="/job/getall" className="hero-cta">
            Browse All Jobs
          </Link>
        </div>
        <div className="image">
          <img
            src="/heroS.jpg"
            alt="hero"
            onLoad={(e) => e.target.classList.add("loaded")}
          />
        </div>
      </div>
      <div className="details">
        {details.map((element) => (
          <div className="card" key={element.id}>
            <div className="icon">{element.icon}</div>
            <div className="content">
              <p>
                <CountUp
                  end={element.title}
                  duration={3}
                  separator=","
                  useEasing={false}
                />
                +
              </p>
              <p>{element.subTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
