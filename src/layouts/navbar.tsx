/**
 * @file Navbar.tsx
 * @description Main navigation component for the iBird application that provides access to
 * core functionalities including wallet connection and theme toggle.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import Wallet from "../wallet/wallet";

/**
 * @component Navbar
 * @description Primary navigation component that renders the application header with logo,
 * version indicator, and interactive controls.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="py-3 px-6 bg-background">
      {/* Main navigation container */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Left section - Logo and branding */}
        <div className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + "/logo-500px-transparent.png"}
            alt="Logo"
            className="w-20 h-auto"
          />
          <h1 className="md:text-lg text-xl mr-3 text-primary font-semibold">
            iBird
          </h1>
          <span className="text-background text-sm bg-gradient-to-r from-primary to-accent rounded p-1">
            v0.0.9
          </span>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center">
          <DarkModeToggle />
          <Wallet />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
