import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Link, RouteProps } from 'react-router-dom';
import GamePage from './pages/GamePage';
import LandingPage from './pages/LandingPage';
import ErrorPage from './pages/ErrorPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        <Route path={`/:uuid`} element={<GamePage />} />
        <Route path="/" element={<LandingPage />} />

        {/* <Route path="*" element={<ErrorPage />} /> */}
      </Routes>
    </ThemeProvider>
  );
}

const UUID_PATTERN =
  '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}';
