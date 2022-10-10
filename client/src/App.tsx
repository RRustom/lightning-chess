import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import LandingPage from './pages/LandingPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import NavBar from './components/NavBar';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path={`/:uuid`} element={<GamePage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
