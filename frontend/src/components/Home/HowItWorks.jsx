import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

const HowItWorks = () => {
  return (
    <div className="howitworks">
      <div className="container">
        <h3>How CareerConnect Works</h3>
        <div className="banner">
          <div className="card">
            <FaUserPlus />
            <p>Create Account</p>
            <p>
              Sign up as a job seeker or employer in seconds. Build your profile
              and get started on your career journey.
            </p>
          </div>
          <div className="card">
            <MdFindInPage />
            <p>Find a Job / Post a Job</p>
            <p>
              Browse thousands of listings or post openings to attract the right
              candidates for your organization.
            </p>
          </div>
          <div className="card">
            <IoMdSend />
            <p>Apply or Recruit</p>
            <p>
              Submit applications with ease or review candidates and shortlist
              the best talent — all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
