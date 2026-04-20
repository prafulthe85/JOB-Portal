import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import PopularCategories from "./PopularCategories";
import PopularCompanies from "./PopularCompanies";
import Loader from "../Loader";

const Home = () => {
  const { isAuthorized } = useContext(Context);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  if (!isAuthorized) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="homePage page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <HeroSection />
          <HowItWorks />
          <PopularCategories />
          <PopularCompanies />
        </>
      )}
    </section>
  );
};

export default Home;
