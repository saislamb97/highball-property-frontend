import { Box, IconButton, useTheme } from "@mui/material";
import { useContext, useEffect, useRef } from "react";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { Logout } from "@mui/icons-material";
import { logoutUser } from "../../store/auth/actions";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logoutUser(navigate));
  };

  const searchRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (searchRef.current?.querySelector('input')) {
      searchRef.current.querySelector('input').value = "";
    }
  }, [pathname]);

  return (
    <Box display="flex" justifyContent="flex-end" p={2}>  {/* Use justifyContent: 'flex-end' for right alignment */}
      <Box display="flex" spacing={2}> {/* Add spacing:2 between child elements */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <Logout className="w-3 h-3 mr-2" />
          Logout
        </button>
      </Box>
    </Box>
  );
};

export default Topbar;
