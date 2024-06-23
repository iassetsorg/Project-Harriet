import React, { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const DarkModeToggle: React.FC = () => {
  // Use React state to track dark mode state
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode") || "false")
  );

  // Effect to add or remove the 'dark' class based on the darkMode state
  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Function to toggle dark mode state
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Render a button that, when clicked, will toggle dark mode
  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center justify-center  text-background bg-primary rounded-xl hover:bg-accent transition duration-300 py-2 px-4"
    >
      {/* Render the icon based on the darkMode state */}
      {darkMode ? (
        <MdLightMode className="text-3xl mr-2" />
      ) : (
        <MdDarkMode className="text-3xl mr-2" />
      )}
      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
};

export default DarkModeToggle;
