import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        <div className="logo">
          <img src="/logo_newone.png" alt="CareerConnect" />
        </div>
        {show && (
          <div className="nav-overlay" onClick={() => setShow(false)} />
        )}
        <ul className={!show ? "menu" : "show-menu menu"}>
          <li>
            <NavLink to="/" onClick={() => setShow(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/job/getall" onClick={() => setShow(false)}>
              Jobs
            </NavLink>
          </li>
          <li>
            <NavLink to="/applications/me" onClick={() => setShow(false)}>
              {user?.role === "Employer" ? "Applications" : "My Applications"}
            </NavLink>
          </li>
          {user?.role === "Employer" && (
            <>
              <li>
                <NavLink to="/job/post" onClick={() => setShow(false)}>
                  Post Job
                </NavLink>
              </li>
              <li>
                <NavLink to="/job/me" onClick={() => setShow(false)}>
                  My Jobs
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/blogs" onClick={() => setShow(false)}>
              Blogs
            </NavLink>
          </li>
          <button onClick={handleLogout}>Logout</button>
        </ul>
        <div className="hamburger" onClick={() => setShow(!show)}>
          {show ? <AiOutlineClose /> : <GiHamburgerMenu />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
