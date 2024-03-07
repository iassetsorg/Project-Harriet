import React, { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const DarkModeToggle: React.FC = () => {
  // Use React state to track dark mode state
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Effect to add or remove the 'dark' class based on the darkMode state
  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }, [darkMode]); // Re-run the effect when darkMode state changes

  // Function to toggle dark mode state
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Render a button that, when clicked, will toggle dark mode
  return (
    <button
      onClick={toggleDarkMode}
      className="font-semibold ml-auto p-1 text-background bg-primary rounded-lg text-xl hover:bg-accent transition duration-300"
    >
      {/* Render the icon based on the darkMode state */}
      {darkMode ? <MdLightMode /> : <MdDarkMode />}
    </button>
  );
};

export default DarkModeToggle;
