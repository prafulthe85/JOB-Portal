import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import nodata from "../../assets/no-data.png";
import Loader from "../Loader";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigateTo = useNavigate();

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsLoading(false); // Set loading to false once the data has been fetched
  //   }, 500);
  // }, []);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
    }
  }, [isAuthorized, navigateTo]);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        let url = "";

        if (user && user.role === "Employer") {
          url = `${
            import.meta.env.VITE_SERVER_URL
          }/api/v1/application/employer/getall`;
        } else {
          url = `${
            import.meta.env.VITE_SERVER_URL
          }/api/v1/application/jobseeker/getall`;
        }

        const res = await axios.get(url, { withCredentials: true });
        setApplications(res.data.applications);

        // if (user && user.role === "Employer") {
        //   axios
        //     .get(
        //       `${
        //         import.meta.env.VITE_SERVER_URL
        //       }/api/v1/application/employer/getall`,
        //       {
        //         withCredentials: true,
        //       }
        //     )
        //     .then((res) => {
        //       setApplications(res.data.applications);
        //     });
        // } else {
        //   axios
        //     .get(
        //       `${
        //         import.meta.env.VITE_SERVER_URL
        //       }/api/v1/application/jobseeker/getall`,
        //       {
        //         withCredentials: true,
        //       }
        //     )
        //     .then((res) => {
        //       setApplications(res.data.applications);
        //     });
        // }
      } catch (error) {
        toast.error(error.response.data.message);
      }
      {
        setIsLoading(false);
      }
    };
    if (isAuthorized && user) {
      fetchApplications();
    }
  }, [isAuthorized, user]);

  // if (!isAuthorized) {
  //   navigateTo("/");
  // }

  const deleteApplication = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/application/delete/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      setApplications((prevApplication) =>
        prevApplication.filter((application) => application._id !== id)
      );
    } catch (error) {
      toast.error(error.response.data.message || "Delete failed");
    }
    {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  console.log("applications", applications);

  return (
    <section className="my_applications page">
      <div className="container">
        <h2 className="section-heading">
          {user?.role === "Job Seeker"
            ? "My Applications"
            : "Applications From Job Seekers"}
        </h2>

        {applications.length === 0 ? (
          <div className="empty-state">
            <img src={nodata} alt="No Data" />
            <p>No applications found</p>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((element) =>
              user?.role === "Job Seeker" ? (
                <JobSeekerCard
                  key={element._id}
                  element={element}
                  deleteApplication={deleteApplication}
                  openModal={openModal}
                />
              ) : (
                <EmployerCard
                  key={element._id}
                  element={element}
                  openModal={openModal}
                />
              )
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

const handleDownload = async (id) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/v1/application/download/${id}`,
      {
        responseType: "blob", // important!
        withCredentials: true,
      }
    );

    const disposition = res.headers["content-disposition"];
    let fileName = "resume.pdf"; // default
    if (disposition && disposition.includes("filename=")) {
      fileName = disposition.split("filename=")[1].replaceAll('"', "").trim();
    }

    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up the blob
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    toast.error("Download failed");
  }
};

const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // ID to delete
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <button onClick={() => handleDownload(element._id)}>
            Download Resume (PDF)
          </button>
        </div>

        {/* <div className="btn_area">
          <button onClick={() => deleteApplication(element._id)}>
            Delete Application
          </button>
        </div> */}
        <div className="btn_area">
          <button
            onClick={() => {
              setConfirmDeleteId(element._id);
              setShowConfirmModal(true);
            }}
          >
            Delete Application
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-message">
              <p>Do you want to delete this application?</p>
            </div>
            <div className="modal-buttons-parent">
              <div className="modal-buttons">
                <button
                  className="yes-button"
                  onClick={() => {
                    deleteApplication(confirmDeleteId);
                    setShowConfirmModal(false);
                  }}
                >
                  Yes
                </button>
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const EmployerCard = ({ element, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <button onClick={() => handleDownload(element._id)}>
            Download Resume (PDF)
          </button>
        </div>
      </div>
    </>
  );
};
