import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set the app root element

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '300px', // Set the width you desire
    padding: '20px', // Adjust the padding
    textAlign: 'center',
  },
};

function DeleteRecordModel({ isOpen, onConfirm, onRequestClose }) {
  const handleConfirm = () => {
    onConfirm();
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Delete Confirmation Modal"
    >
      <p>Are you sure you want to delete?</p>
      <button onClick={handleConfirm}>Yes</button>
      &nbsp;
      <button onClick={onRequestClose}>No</button>
    </Modal>
  );
}

export default DeleteRecordModel;


