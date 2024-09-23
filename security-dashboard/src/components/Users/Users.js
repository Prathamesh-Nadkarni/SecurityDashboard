import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem
} from '@mui/material';
import TopBar from '../Dashboard/TopBar/TopBar';
import { setHeaders } from '../../utils/headers';
import './Users.css';

const UserTable = () => {
  const [users, setUsers] = useState([]);  // Initialize as an empty array
  const [updatedRoles, setUpdatedRoles] = useState({});

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/users', {
          method: 'GET',
          headers: {
            ...setHeaders()
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();  // Use response.json() to parse the response
        setUsers(data);  // Assuming the response is the users array
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle role change in dropdown
  const handleRoleChange = (username, newRole) => {
    setUpdatedRoles((prevRoles) => ({
      ...prevRoles,
      [username]: newRole,
    }));
  };

  // Submit updated roles to the backend
  const handleSubmit = async (username) => {
    const updatedRole = updatedRoles[username];
    if (updatedRole) {
      try {
        await fetch(`http://127.0.0.1:5000/api/user/role/${username}`, {
          method: 'PUT',
          headers: {
            ...setHeaders(),
          },
          body: JSON.stringify({ role: updatedRole }),
        });
        alert(`User ${username}'s role updated successfully`);
      } catch (error) {
        console.error('Error updating user role:', error);
        alert('Failed to update role');
      }
    }
  };

  return (
    <>
      <TopBar />
      <TableContainer component={Paper} className="table-container">
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={updatedRoles[user.username] || user.role}
                    onChange={(e) => handleRoleChange(user.username, e.target.value)}
                    className="select-role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="view">Viewer</MenuItem>
                    <MenuItem value="edit">Moderator</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className="submit-button"
                    onClick={() => handleSubmit(user.username)}
                  >
                    Submit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UserTable;
