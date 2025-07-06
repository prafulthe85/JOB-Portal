import React, { useEffect } from "react";
import "./ConfirmModal.css";
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  useEffect(() => {
    // Disable background scroll on both <html> and <body>
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Restore scroll when modal unmounts
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button onClick={onConfirm} className="yes-btn">
            Yes
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
