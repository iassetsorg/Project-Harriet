/**
 * @fileoverview Bottom navigation bar component for mobile view that displays navigation links
 * and external references.
 */

import React, { FC, useState } from "react";
import { IoHome } from "react-icons/io5";
import { MdExplore } from "react-icons/md";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { IoNewspaperOutline } from "react-icons/io5";
import { TbNeedleThread } from "react-icons/tb";
import { FaPen } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { useWalletContext } from "../wallet/WalletContext";
import { MdOutlinePublic } from "react-icons/md";

/**
 * @typedef {Object} MenuItem
 * @property {JSX.Element} icon - React icon component to display
 * @property {string} text - Display text for the menu item
 * @property {string} link - URL or route path
 * @property {boolean} isExternal - Whether the link opens in new tab
 */

/**
 * Array of navigation items defining the bottom bar menu structure
 * @type {MenuItem[]}
 */
const menuItems = [
  {
    icon: <MdOutlinePublic className="text-2xl" />,
    text: "Explore",
    link: "/Explore",
    isExternal: false,
  },

  {
    icon: <CgProfile className="text-2xl" />,
    text: "Profile",
    link: "/Profile",
    isExternal: false,
  },

  // {
  //   icon: <IoNewspaperOutline className="text-2xl" />,
  //   text: "About",
  //   link: "/About",
  //   isExternal: false,
  // },
  {
    icon: <FaCode className="text-2xl" />,
    text: "GitHub ",
    link: "https://github.com/iassetsorg/Project-Harriet",
    isExternal: true,
  },
  {
    icon: <FaRegCircle className="text-2xl" />,
    text: "iAssets ",
    link: "https://iassets.org/",
    isExternal: true,
  },
];

/**
 * Mobile bottom navigation bar component that provides main navigation options
 * and external links. Only visible on mobile devices (hidden on md+ breakpoints).
 *
 * Features:
 * - Filters menu items based on wallet connection status
 * - Highlights active route
 * - Supports both internal routing and external links
 * - Responsive design for mobile view
 *
 * @component
 * @returns {JSX.Element} Bottom navigation bar
 */
const BottomBar = () => {
  const { isConnected } = useWalletContext();

  /**
   * Filters menu items to show/hide Profile and Threads based on wallet connection
   * @type {MenuItem[]}
   */
  const filteredMenuItems = menuItems.filter(
    (item) =>
      !(item.text === "Threads" || item.text === "Profile") || isConnected
  );

  const location = useLocation();

  return (
    <div className="md:hidden">
      {/* 
        Fixed position container at bottom of viewport
        Only visible on mobile (hidden on md+ breakpoints)
      */}
      <div className="fixed bottom-0 left-0 right-0 bg-background  border-text p-2 flex justify-around items-center">
        {filteredMenuItems.map((item) => (
          <Link
            to={item.link}
            className={`flex flex-col items-center px-3 py-1.5 rounded hover:bg-secondary transition-colors duration-200
              ${
                location.pathname === item.link
                  ? "bg-secondary/30" // Active route highlighting
                  : "hover:bg-secondary/50" // Hover state
              }`}
            key={item.text}
            target={item.isExternal ? "_blank" : undefined}
            title={item.text}
          >
            {/* 
              Clone icon element to add dynamic styling based on active state
              Uses primary color for active route, default text color otherwise
            */}
            {React.cloneElement(item.icon, {
              className: `text-2xl ${
                location.pathname === item.link ? "text-primary" : "text-text"
              }`,
            })}
            <span
              className={`text-xs font-medium mt-1 ${
                location.pathname === item.link ? "text-primary" : "text-text"
              }`}
            >
              {item.text}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
