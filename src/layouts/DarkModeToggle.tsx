/**
 * @fileoverview Component that provides a theme toggle button for switching between different color themes
 * @component ThemeToggle
 */

import React, { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { IoWater } from "react-icons/io5";
import { IoLeafOutline } from "react-icons/io5";
import { IoSunnyOutline } from "react-icons/io5";

/**
 * @typedef {('light'|'dark'|'blue'|'orange'|'green')} Theme
 * Defines the available theme options for the application
 */
type Theme = "light" | "dark" | "blue" | "orange" | "green";

/**
 * ThemeToggle component that manages and displays the current theme selection
 * Persists theme choice in localStorage and updates document classes accordingly
 *
 * @component
 * @returns {JSX.Element} A button that cycles through available themes
 */
const ThemeToggle: React.FC = () => {
  /**
   * State hook for managing the current theme
   * Initializes from localStorage or defaults to 'dark' theme
   */
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "dark"
  );

  /**
   * Effect hook that handles theme changes
   * Updates document classes and persists theme choice to localStorage
   */
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      "dark",
      "light",
      "blue",
      "orange",
      "green"
    );
    // Add the current theme class
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Cycles to the next theme in the predefined order
   * Order: light → dark → blue → orange → green
   */
  const cycleTheme = () => {
    const themeOrder: Theme[] = ["light", "dark", "blue", "orange", "green"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  /**
   * Returns the appropriate icon component based on current theme
   * @returns {JSX.Element} Icon component for the current theme
   */
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <MdLightMode className="text-2xl" />;
      case "dark":
        return <MdDarkMode className="text-2xl" />;
      case "blue":
        return <IoWater className="text-2xl" />;
      case "orange":
        return <IoSunnyOutline className="text-2xl" />;
      case "green":
        return <IoLeafOutline className="text-2xl" />;
    }
  };

  /**
   * Returns the display text for the current theme
   * @returns {string} Capitalized theme name
   */
  const getThemeText = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "blue":
        return "Blue";
      case "orange":
        return "Orange";
      case "green":
        return "Green";
    }
  };

  /**
   * Renders the theme toggle button with current theme icon and text
   */
  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center text-background bg-primary rounded-xl hover:bg-accent transition duration-300 p-2 mr-2"
    >
      {getThemeIcon()}
    </button>
  );
};

export default ThemeToggle;
