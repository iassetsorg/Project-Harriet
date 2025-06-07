/**
 * @fileoverview Component that provides a theme toggle button for switching between different color themes
 * @component ThemeToggle
 */

import React, { useState, useEffect } from "react";
import { MdDarkMode } from "react-icons/md";
import { IoHeart, IoDiamond, IoWater } from "react-icons/io5";
import { FaGem } from "react-icons/fa";

/**
 * @typedef {('dark'|'blue'|'lovely-red'|'gemmy-purple'|'sky-blue-diamond')} Theme
 * Defines the available theme options for the application
 */
type Theme =
  | "dark"
  | "blue"
  | "lovely-red"
  | "gemmy-purple"
  | "sky-blue-diamond";

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
   * Migrates old theme names to new ones
   */
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");

    // Migration: Convert old theme names to new ones
    const themeMap: Record<string, Theme> = {
      light: "dark",
      orange: "lovely-red",
      green: "gemmy-purple",
    };

    if (savedTheme && themeMap[savedTheme]) {
      localStorage.setItem("theme", themeMap[savedTheme]);
      return themeMap[savedTheme];
    }

    return (savedTheme as Theme) || "dark";
  });

  /**
   * Effect hook that handles theme changes
   * Updates document classes and persists theme choice to localStorage
   */
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      "dark",
      "blue",
      "lovely-red",
      "gemmy-purple",
      "sky-blue-diamond"
    );
    // Add the current theme class
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Cycles to the next theme in the predefined order
   * Order: dark → blue → lovely-red → gemmy-purple → sky-blue-diamond
   */
  const cycleTheme = () => {
    const themeOrder: Theme[] = [
      "dark",
      "blue",
      "lovely-red",
      "gemmy-purple",
      "sky-blue-diamond",
    ];
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
      case "dark":
        return <MdDarkMode className="text-2xl" />;
      case "blue":
        return <IoWater className="text-2xl" />;
      case "lovely-red":
        return <IoHeart className="text-2xl" />;
      case "gemmy-purple":
        return <FaGem className="text-2xl" />;
      case "sky-blue-diamond":
        return <IoDiamond className="text-2xl" />;
    }
  };

  /**
   * Returns the display text for the current theme
   * @returns {string} Capitalized theme name
   */
  const getThemeText = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "blue":
        return "Deep Blue";
      case "lovely-red":
        return "Rose Pink";
      case "gemmy-purple":
        return "Gemmy Purple";
      case "sky-blue-diamond":
        return "Sky Blue Diamond";
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
