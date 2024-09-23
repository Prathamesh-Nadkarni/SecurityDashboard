// headers.js
import { jwtDecode } from 'jwt-decode';

// Module-scoped JWT variable
let JWT = '';
let role = '';
let username = '';

// Function to set the JWT value
export const setJwt = (jwt) => {
    JWT = jwt;
    localStorage.setItem('jwtToken', jwt);
};

// Function to get the JWT value
export const getJwt = () => {
    if (!JWT) {
        JWT = localStorage.getItem('jwtToken');  // Retrieve from localStorage if not in memory
    }
    return JWT;
};

// Function to set headers with JWT
export const setHeaders = () => {
    JWT = getJwt();
    if (!JWT) {
        throw new Error('JWT is not defined. Please set JWT before making requests.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + JWT,
        'X-Requested-From': 'React'
    };
};


export const getRole = () => {
    if (role != '') {
        return role;
    }
    else {
        try {
        const decodedToken = jwtDecode(JWT);
        return decodedToken.role;
        } catch (error) {
        console.error('Invalid token:', error);
        return null;
        }
    }
  };

  export const getUsername = () => {
    if (username != '') {
        return username;
    }
    else {
        try {
        const decodedToken = jwtDecode(JWT);
        return decodedToken.sub;
        } catch (error) {
        console.error('Invalid token:', error);
        return null;
        }
    }
  };