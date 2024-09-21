import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { encrypt } from '../../utils/crypt';
import CryptoJS from 'crypto-js';

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
    <div className="login-page">
      <h1 className="title">Login</h1>
      <form onSubmit={handleLogin}>
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
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
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
    </div>
  );
};

export default LoginPage;
