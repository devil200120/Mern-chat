import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import Login from "./components/Login";
import Messenger from "./components/Messenger";
import ProtectRoute from "./components/ProtectRoute";
import Register from "./components/Register";
import OAuthCallback from "./components/OAuthCallback";
import { lazy, Suspense } from 'react';

// Alert configuration
const alertOptions = {
  position: positions.TOP_CENTER,
  timeout: 5000,
  offset: '30px',
  transition: transitions.SCALE
};

// Lazy load the Loader component to reduce initial bundle size
const Loader = lazy(() => import('./components/Loader'));

// Simple fallback for the loader itself
const LoaderFallback = () => (
  <div style={{
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    background: "#243b55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px"
  }}>
    Loading...
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual loading/initialization logic
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500); // Increased to 2.5 seconds to better showcase the animation

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Suspense fallback={<LoaderFallback />}>
        <Loader />
      </Suspense>
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <Routes>
            <Route path="/messenger/login" element={<Login />} />
            <Route path="/messenger/register" element={<Register />} /> 
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="/" element={<ProtectRoute><Messenger /></ProtectRoute>} />
          </Routes>
        </AlertProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
