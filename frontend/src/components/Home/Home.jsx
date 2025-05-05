import React from "react";
import { useContext, useState, useEffect } from "react";
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
    // Simulate an API call or any async operation
    setTimeout(() => {
      setIsLoading(false); // Set loading to false once the data has been fetched
    }, 500); // Adjust the timeout as needed
  }, []);

  if (!isAuthorized) {
    return <Navigate to={"/login"} />;
  }

  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <section className="homePage page">
        <HeroSection />
        <HowItWorks />
        <PopularCategories />
        <PopularCompanies />
      </section>
    </>
  );
};

export default Home;
