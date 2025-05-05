import React, { useEffect, useState } from "react";
import "./Loader.css";

const Loader = () => {
  const [progress, setProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 30);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="advanced-loader-bg">
      <div className="advanced-loader-wrapper">
        {/* Main 3D circle container */}
        <div className="loader-circle outer">
          <div className="loader-circle middle">
            <div className="loader-circle inner">
              <div className="loader-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="orbit-container">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="orbit-dot"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                transform: `rotate(${i * 72}deg) translateX(85px)`
              }}
            ></div>
          ))}
        </div>
        
        {/* Progress ring */}
        <svg className="progress-ring" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14ffe9" />
              <stop offset="50%" stopColor="#ffeb3b" />
              <stop offset="100%" stopColor="#ff00e0" />
            </linearGradient>
          </defs>
          <circle 
            className="progress-ring-bg" 
            cx="50" cy="50" r="45" 
          />
          <circle 
            className="progress-ring-circle" 
            cx="50" cy="50" r="45"
            strokeDasharray="283" 
            strokeDashoffset={283 - (283 * progress) / 100} 
          />
        </svg>
      </div>
      
      {/* Messenger text with animated gradient */}
      <div className="loader-text-container">
        <h2 className="app-name">MESSENGER</h2>
        <div className="loading-text">
          <span>Loading</span>
          <span className="dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </div>
        <div className="progress-value">{progress}%</div>
      </div>
    </div>
  );
};

export default Loader;
