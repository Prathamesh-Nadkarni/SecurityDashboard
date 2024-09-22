import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { encrypt } from '../../utils/crypt';
import CryptoJS from 'crypto-js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Pic1 from '../../assets/Pic1.png';
import Pic2 from '../../assets/Pic2.png';
import DoubleArrowSharpIcon from '@mui/icons-material/DoubleArrowSharp';

const authenticateYubikey = async (username) => {
  const publicKeyOptions = {
    challenge: new Uint8Array(32), // Replace with real challenge from backend
    allowCredentials: [
      {
        id: new Uint8Array(16), // Replace with actual credential ID
        type: 'public-key'
      }
    ],
    timeout: 60000,
    userVerification: 'required'
  };

  try {
    const credential = await navigator.credentials.get({ publicKey: publicKeyOptions });
    return credential;
  } catch (err) {
    console.error('Yubikey authentication failed:', err);
    throw new Error('Yubikey authentication failed');
  }
};

const encryptPassword = (password, key) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
  });

  console.log("IV (Base64):", iv.toString(CryptoJS.enc.Base64));
  console.log("Ciphertext (Base64):", encrypted.ciphertext.toString(CryptoJS.enc.Base64));

  return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
};


const LoginPage = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [useYubikey, setUseYubikey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      let response;

      if (useYubikey) {
        const credential = await authenticateYubikey(username);

        response = await fetch('http://127.0.0.1:5000/api/yubikey-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            credential
          }),
        });
      } else {
        const key = 'mysecretkey12345';
        const encryptedPassword = encryptPassword(password, key); // Encrypt the password here
        response = await fetch('http://127.0.0.1:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password: encryptedPassword }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setAuth(true);
        localStorage.setItem('username', data.username);
        localStorage.setItem('auth', 'true');
        navigate('/');
      } else {
        setError('Invalid username, password, or Yubikey');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    
    <div className="page-container">
  <div className="logo-container">
    <img
      src="https://sts.cs.illinois.edu/assets/themes/lab/images/logo/lab-logo.png"
      className="logo"
      alt="STS Labs Logo"
    />
    <h2 className="sts-text">STS Labs</h2>
  </div>

  <div className="login-page">
    <h1 className="title">Login</h1>
    <form onSubmit={handleLogin} className="login-form">
      <div className="input-group">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      {!useYubikey && (
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {showPassword ? (
            <VisibilityOffIcon
              className="visibility-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <VisibilityIcon
              className="visibility-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <div className="yubikey-option">
        <label>
          <input
            type="checkbox"
            checked={useYubikey}
            onChange={() => setUseYubikey(!useYubikey)}
          />
          Use Yubikey
        </label>
      </div>
      <button type="submit" className="login-button">Login</button>
    </form>
    <p>Don't have an account? <a href="/create-user">Create one</a></p>
    
    {/* Website Functionalities Section */}
  </div>
{/* 
  <div className="functionality-description">
    <h3>Website Functionalities</h3>
    <p>
      Welcome to our website! This platform offers a comprehensive analysis of the threat landscape on your machines, equipping you with an intuitive alerts dashboard that notifies you immediately when a threat is detected. In addition to real-time alerts, you can explore detailed network graphs that facilitate in-depth analysis of threats, enabling users to debug issues and assess their severity.
    </p>

    <div className="images-section">
      <div className="image-container">
        <img src={Pic1} alt="Pic 1" className="image" />
        <p className="image-caption">Analyze</p>
      </div>
      <span className="arrow">
        <DoubleArrowSharpIcon fontSize="large" style={{ fontSize: '5rem' }} />
      </span>
      <div className="image-container">
        <img src={Pic2} alt="Pic 2" className="image" />
        <p className="image-caption">Resolve</p>
      </div>
    </div>
    <p>
      With features like instant filtering and sorting, navigating any node path in a graph becomes effortless. To enhance your security, the website supports two-factor authentication, ensuring that your data remains protected. Join us today and take the first step toward securing your machines!
    </p>
  </div>*/}
</div>


  );
};

export default LoginPage;
