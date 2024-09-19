import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUserPage.css';

// Validation functions
const validateUsername = (username) => /^[a-zA-Z0-9_]{3,30}$/.test(username);
const validateName = (name) => /^[a-zA-Z\s]{1,100}$/.test(name);
const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const sanitizeInput = (input) => input.replace(/<[^>]*>/g, '');

const CreateUserPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [yubikey, setYubikey] = useState('');
  const [registerYubikey, setRegisterYubikey] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    // Reset errors
    setError('');
    setEmailError('');
    setPasswordError('');

    // Sanitize input
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedName = sanitizeInput(name);

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return;
    }

    if (!validateUsername(sanitizedUsername)) {
      setError('Invalid username format');
      return;
    }

    if (!validateName(sanitizedName)) {
      setError('Invalid name format');
      return;
    }

    const userData = {
      username: sanitizedUsername,
      password,
      email,
      name: sanitizedName,
      yubikey: registerYubikey ? yubikey : '',
    };

    localStorage.setItem('userData', JSON.stringify(userData));

    if (registerYubikey) {
      try {
        const credential = await registerYubikeyCredential();
        localStorage.setItem('yubikeyCredential', JSON.stringify(credential));
      } catch (err) {
        setError('Failed to register Yubikey');
        return;
      }
    }

    fetch('http://127.0.0.1:5000/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigate('/login');
        } else {
          setError('Failed to create user');
        }
      })
      .catch(() => {
        setError('Failed to create user');
      });
  };

  const registerYubikeyCredential = async () => {
    // Generate a unique challenge and user ID
    const challenge = new Uint8Array(32);
    const userId = new Uint8Array(16);
  
    // Populate challenge and user ID
    crypto.getRandomValues(challenge);
    crypto.getRandomValues(userId);
  
    const publicKey = {
      challenge: challenge,
      rp: { name: "Your App" },
      user: {
        id: userId,
        name: username,
        displayName: name,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 } // ES256
      ],
      timeout: 60000,
      attestation: "direct"
    };
  
    try {
      const credential = await navigator.credentials.create({ publicKey });
      console.log('Yubikey credential registered:', credential);
      return credential;
    } catch (err) {
      console.error('Error registering Yubikey:', err);
      throw new Error('Yubikey registration failed');
    }
  };

  return (
    <div className="create-user-page">
      <h1 className="title">Create User</h1>
      <form onSubmit={handleCreateUser}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {passwordError && <p className="error">{passwordError}</p>}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {emailError && <p className="error">{emailError}</p>}

        <div className="yubikey-registration">
          <label>
            <input
              type="checkbox"
              checked={registerYubikey}
              onChange={() => setRegisterYubikey(!registerYubikey)}
            />
            Register Yubikey
          </label>
          {registerYubikey && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Yubikey ID"
                value={yubikey}
                onChange={(e) => setYubikey(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="create-button">Create</button>
      </form>
    </div>
  );
};

export default CreateUserPage;
