import React from "react";

const CompassLogo = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="20" cy="20" r="12" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="20" cy="20" r="4" stroke="#3B82F6" strokeWidth="2" />
      <path d="M20 1V6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 34V39" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M39 20H34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20H1" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M32.5 7.5L29 11" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 29L7.5 32.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M32.5 32.5L29 29" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 11L7.5 7.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M27 20L20 13L13 20L20 27L27 20Z" fill="#60A5FA" fillOpacity="0.4" />
    </svg>
  );
};

export default CompassLogo;
