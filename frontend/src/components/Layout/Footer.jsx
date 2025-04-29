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
      <div>&copy; All Rights Reserved by Praful | Candid GMAD.</div>
      <div>
        <Link to={"https://github.com/prafulthe85"} target="github">
          <FaGithub></FaGithub>
        </Link>
        <Link to={"https://leetcode.com/u/PrafulGupta85/"} target="leetcode">
          <SiLeetcode></SiLeetcode>
        </Link>
        <Link
          to={"https://www.linkedin.com/in/prafulgupta85/"}
          target="linkedin"
        >
          <FaLinkedin></FaLinkedin>
        </Link>
        <Link
          to={"https://www.instagram.com/candid_gmad_85/"}
          target="instagram"
        >
          <RiInstagramFill></RiInstagramFill>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
