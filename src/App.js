// App.js
import React, { useEffect, useState } from 'react';
import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Spinner } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import Topbar from './pages/global/Topbar';
import Sidebar from './pages/global/Sidebar';
import AppRoutes from './route';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalVariable } from './store/actions';
import * as storage from 'src/utils/storage';

function App() {
  const [theme, colorMode] = useMode();
  const { user } = useSelector((state) => state.GlobalVariable);
  const [isSidebar, setIsSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuthenticated = !!storage.get("token");

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      window.location.href = '/login';
    }
    setIsLoading(false);
  }, [isAuthenticated, isLoginPage]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(setGlobalVariable("user", storage.get("user")));
    }
  }, [dispatch, isAuthenticated, user]);

  if (isLoading) {
    return <Spinner color="primary" />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {!isLoginPage && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {!isLoginPage && <Topbar setIsSidebar={setIsSidebar} />}
            <AppRoutes isAuthenticated={String(isAuthenticated)} />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
