import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DeleteProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Project deleted successfully');
      navigate('/');
    } else {
      alert('Error deleting project');
    }
  };

  return (
    <div className="delete-project-container">
      <h2>Delete Project</h2>
      <p>Are you sure you want to delete this project?</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default DeleteProject;
