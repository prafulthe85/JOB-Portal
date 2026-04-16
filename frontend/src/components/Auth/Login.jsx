import React, { useContext, useState, useRef, useEffect } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [useDemoCreds, setUseDemoCreds] = useState(false);

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const { isAuthorized, setIsAuthorized } = useContext(Context);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/user/login`,
        { email, password, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setEmail("");
      setPassword("");
      setRole("");
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response.data.message);
      // setLoading(false);
    }
  };

  const handleDemoCheckbox = (e) => {
    const checked = e.target.checked;

    if (!role) {
      alert("Please select role first");
      return;
    }

    setUseDemoCreds(checked);

    if (checked) {
      if (role === "Employer") {
        setEmail("guptapraful130@gmail.com");
        setPassword("Praful@1234");
      } else if (role === "Job Seeker") {
        setEmail("guptapraful130+2@gmail.com");
        setPassword("Praful@1234");
      }
    } else {
      setEmail("");
      setPassword("");
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <section className="authPage">
        <div className="container">
          <div className="header">
            <img src="/careerconnect-black.png" alt="logo" />
            <h3>Login to your account</h3>
          </div>
          <form>
            <div className="inputTag">
              <label>Login As</label>
              <div className="auth-role-field" ref={roleDropdownRef}>
                <button
                  type="button"
                  className={`auth-role-btn${roleDropdownOpen ? " open" : ""}${!role ? " placeholder" : ""}`}
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                >
                  {role || "Select Role"}
                  <span className="auth-role-chevron">▼</span>
                </button>
                {roleDropdownOpen && (
                  <div className="auth-role-list">
                    {["Job Seeker", "Employer"].map((opt) => (
                      <div
                        key={opt}
                        className={`auth-role-item${role === opt ? " selected" : ""}`}
                        onClick={() => {
                          setRole(opt);
                          setRoleDropdownOpen(false);
                          setUseDemoCreds(false);
                          setEmail("");
                          setPassword("");
                        }}
                      >
                        <span className="auth-role-dot"></span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                <span className="auth-icon-box"><FaRegUser /></span>
              </div>
            </div>
            <div className="inputTag">
              <label>Email Address</label>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <MdOutlineMailOutline />
              </div>
            </div>
            <div className="inputTag">
              <label>Password</label>
              <div>
                <input
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <RiLock2Fill />
              </div>
            </div>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <div className={`demo-creds-card${useDemoCreds ? " active" : ""}`}>
              <label className="demo-label">
                <input
                  type="checkbox"
                  checked={useDemoCreds}
                  onChange={handleDemoCheckbox}
                  className="demo-checkbox-input"
                />
                <span className="demo-text">
                  <strong>Use demo credentials to Login and explore
                  </strong>
                </span>
              </label>
            </div>
            <button type="submit" onClick={handleLogin}>
              Login
            </button>
            <Link to={"/register"}>Register Now</Link>
          </form>
        </div>
        <div className="banner">
          <img src="/login.png" alt="login" />
        </div>
      </section>
    </>
  );
};

export default Login;
