import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormSubmit } from "src/services/users";
import useToast from "src/hooks/useToast";
import Header from "../../components/Header";

const roles = ['ADMIN', 'USER'];
const genders = ['MALE', 'FEMALE'];

const UserForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { state } = useLocation();
  const user = state?.user;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    full_name: '',
    gender: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || '',
        phone: user.phone || '',
        full_name: user.full_name || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const mutation = useFormSubmit({
    onSuccess: () => {
      toast('User created successfully', 1);
      navigate("/user");
    },
    onError: (e) => {
      toast('Failed to create user', -1);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
    }
    if (user) {
      submitData.id = user.id;
    }
    mutation.mutate(submitData);
  };

  return (
    <Box m="20px">
      <Header title={user ? "Edit User" : "Create User"} subtitle={user ? "Edit the details of the user" : "Fill in the form to create a new user"} />
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          inputProps={{ minLength: 6 }}
          fullWidth
          placeholder={user ? "Leave blank to keep current password" : ""}
        />
        <FormControl required fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth required>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            {genders.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {user ? "Update User" : "Create User"}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;
