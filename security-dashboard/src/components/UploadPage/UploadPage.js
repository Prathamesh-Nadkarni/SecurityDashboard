import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';
import TopBar from '../Dashboard/TopBar/TopBar';
import { setHeaders } from '../../utils/headers';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    // Validate file type (only CSV files)
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setErrorMessage('Please upload a valid CSV file.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setIsLoading(true); // Show loading indicator

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        headers: {
          ...setHeaders(),
        },
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('File uploaded successfully.');
        setTimeout(() => navigate('/processing'), 1500); // Redirect after 1.5 seconds
      } else {
        const data = await response.json();
        if (data.error === 'This file has already been uploaded. Please try a different file.') {
          setErrorMessage(data.error);
        } else {
          setErrorMessage('Error uploading file.');
        }
      }
    } catch (error) {
      setErrorMessage('Error uploading file.');
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <TopBar>
      <div className="upload-page">
        <h1 className="title">Upload CSV</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button onClick={handleUpload} className="upload-button" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </TopBar>
  );
};

export default UploadPage;
