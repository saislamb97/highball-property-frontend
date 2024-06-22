import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, useTheme, Alert } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/auth/actions";
import { setGlobalVariable } from "../../store/actions";
import logo from "../../assets/logo.png";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loginError, isAuthenticated, user } = useSelector(
    (state) => state.Auth
  );

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setGlobalVariable("user", user?.user));
      navigate("/");
    }
  }, [dispatch, isAuthenticated, navigate, user]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    setEmailError("");

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordError("");

    dispatch(
      login(
        { email, password },
        navigate
      )
    );
  };

  return (
    <Box
      className="flex h-screen items-center justify-center"
      style={{ backgroundColor: colors.primary[500] }}
    >
      <Box
        width="100%"
        maxWidth="sm"
        borderRadius={4}
        bgcolor={colors.primary[400]}
        color={colors.grey[100]}
        p={4}
      >
        <div className="text-center">
          <Header
            title="LOGIN"
            subtitle="Highball."
          />
        </div>
        {loginError && (
          <div className="mb-3 fs-18">
            <Alert variant="filled" severity="error">
              {loginError}
            </Alert>
          </div>
        )}
        <Box className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-32 w-60 m-2 p-2" />
        </Box>
        <form
          className="mb-4"
          noValidate
          autoComplete="off"
          onSubmit={handleLogin}
        >
          <TextField
            fullWidth
            variant="outlined"
            InputProps={{
              style: {
                borderRadius: 4,
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                marginBottom: 40,
              },
              placeholder: "Email ID",
              startAdornment: <MailOutlineOutlinedIcon className="mr-4" />,
            }}
            InputLabelProps={{
              style: {
                color: colors.grey[100],
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: "-10px",
              },
            }}
            id="email"
            type="email"
            name="email"
            label="Email ID"
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={
              <Typography
                variant="caption"
                color="error"
                style={{ top: "50px", position: "absolute", fontSize: "12px" }}
              >
                {emailError}
              </Typography>
            }
          />
          <TextField
            fullWidth
            variant="outlined"
            InputProps={{
              style: {
                borderRadius: 4,
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                marginBottom: 15,
              },
              placeholder: "Password",
              startAdornment: <LockOutlinedIcon className="mr-4" />,
            }}
            InputLabelProps={{
              style: {
                color: colors.grey[100],
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: "-10px",
              },
            }}
            id="password"
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={
              <Typography
                variant="caption"
                color="error"
                style={{ top: "50px", position: "absolute", fontSize: "12px" }}
              >
                {passwordError}
              </Typography>
            }
          />
          <Button
            fullWidth
            variant="contained"
            style={{
              borderRadius: 4,
              backgroundColor: colors.blueAccent[800],
              color: colors.grey[100],
              fontSize: 18,
              marginTop: 20,
              paddingTop: 10,
              paddingBottom: 10,
              fontWeight: "bold",
            }}
            type="submit"
          >
            LOGIN
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
