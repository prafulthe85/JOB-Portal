import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>Do you want to delete this application?</p>
        <div className="modal-buttons">
          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
