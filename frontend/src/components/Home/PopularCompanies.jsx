import React from "react";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";

const PopularCompanies = () => {
  const companies = [
    {
      id: 1,
      title: "Grazitti Interactive",
      location: "IT Park, Chandigarh",
      openPositions: 12,
      url: "https://www.grazitti.com/company/careers/",
      logo: "/GrazittiLogo.png",
    },
    {
      id: 2,
      title: "OYO",
      location: "IT Park, Gurugram",
      openPositions: 5,
      url: "https://www.linkedin.com/company/oyo-rooms/jobs/",
      logo: "/OYOlogo.png",
    },
    {
      id: 3,
      title: "Eternal",
      location: "IT Park, Chandigarh",
      openPositions: 20,
      url: "https://www.eternal.com/careers/",
      logo: "Eternal.webp",
    },
  ];
  return (
    <div className="companies">
      <div className="container">
        <h3>TOP COMPANIES</h3>
        <div className="banner">
          {companies.map((element) => {
            return (
              <div className="card" key={element.id}>
                <div className="content">
                  <div className="icon">
                    {element.logo ? (
                      <img
                        src={element.logo}
                        alt={element.title}
                        style={{ width: "40px", height: "40px" }}
                      />
                    ) : (
                      element.icon
                    )}
                  </div>
                  <div className="text">
                    <p>{element.title}</p>
                    <p>{element.location}</p>
                  </div>
                </div>
                <button onClick={() => window.open(element.url, "_blank")}>
                  Open Positions {element.openPositions}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopularCompanies;
