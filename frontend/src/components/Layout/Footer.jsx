import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { RiInstagramFill } from "react-icons/ri";

function Footer() {
  const { isAuthorized } = useContext(Context);
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/logo_newone.png"
            alt="CareerConnect"
            className="footer-logo"
          />
          <p>
            Connecting talent with opportunity. Your next career move starts
            here.
          </p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/job/getall">Browse Jobs</Link>
          <Link to="/blogs">Blogs</Link>
        </div>
        <div className="footer-social">
          <h4>Connect</h4>
          <div className="footer-social-icons">
            <a
              href="https://github.com/prafulthe85"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
            </a>
            <a
              href="https://leetcode.com/u/PrafulGupta85/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiLeetcode />
            </a>
            <a
              href="https://www.linkedin.com/in/prafulgupta85/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.instagram.com/candid_gmad_85/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiInstagramFill />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} CareerConnect. Built by Praful
          Gupta.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
