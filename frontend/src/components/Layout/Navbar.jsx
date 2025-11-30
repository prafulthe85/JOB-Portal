import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { NavLink, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai"; // Import the close icon

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message), setIsAuthorized(true);
    }
  };

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        <div className="logo">
          <img src="/logo_newone.png" alt="logo" />
        </div>
        <ul className={!show ? "menu" : "show-menu menu"}>
          <li>
            <NavLink
              to={"/"}
              onClick={() => setShow(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/job/getall"}
              onClick={() => setShow(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              ALL JOBS
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/applications/me"}
              onClick={() => setShow(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {user && user.role === "Employer"
                ? "APPLICANT'S APPLICATIONS"
                : "MY APPLICATIONS"}
            </NavLink>
          </li>
          {user && user.role === "Employer" ? (
            <>
              <li>
                <NavLink
                  to={"/job/post"}
                  onClick={() => setShow(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  POST NEW JOB
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"/job/me"}
                  onClick={() => setShow(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  VIEW YOUR JOBS
                </NavLink>
              </li>
            </>
          ) : null}
          <li>
            <NavLink
              to={"/blogs"}
              onClick={() => setShow(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              BLOGS
            </NavLink>
          </li>

          <button onClick={handleLogout}>LOGOUT</button>
        </ul>
        <div className="hamburger" onClick={() => setShow(!show)}>
          {show ? <AiOutlineClose /> : <GiHamburgerMenu />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
