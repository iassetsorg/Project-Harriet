/**
 * @file Sidebar.tsx
 * @description Provides the main navigation sidebar component for the application
 */

import React, { FC } from "react";
import { useLocation, Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { MdExplore } from "react-icons/md";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { IoNewspaperOutline } from "react-icons/io5";
import { TbNeedleThread } from "react-icons/tb";
import { FaPen } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import { useWalletContext } from "../wallet/WalletContext";

/**
 * @interface MenuItem
 * @description Defines the structure for navigation menu items
 * @property {JSX.Element} icon - React icon component to display
 * @property {string} text - Display text for the menu item
 * @property {string} link - Navigation path or external URL
 * @property {boolean} isExternal - Whether the link opens in a new tab
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
 * @component Sidebar
 * @description Main navigation sidebar component that displays menu items and handles navigation
 * Features:
 * - Responsive design (hidden on mobile)
 * - Dynamic menu filtering based on wallet connection
 * - Visual feedback for active routes
 * - Support for both internal and external links
 */
export const Sidebar: FC = () => {
  const { isConnected } = useWalletContext();

  /**
   * Filter menu items based on wallet connection status
   * Threads and Profile are only shown when wallet is connected
   */
  const filteredMenuItems = menuItems.filter(
    (item) =>
      !(item.text === "Threads" || item.text === "Profile") || isConnected
  );

  const location = useLocation();

  return (
    <>
      <div className="flex">
        {/* Main sidebar container with responsive visibility */}
        <div className="flex flex-col items-center text-text h-screen bg-background">
          <div className="w-full px-2 hidden md:inline">
            <div className="flex flex-col items-center w-full mt-3">
              {/* Map through filtered menu items and render navigation links */}
              {filteredMenuItems.map((item) => (
                <Link
                  to={item.link}
                  className={`flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-secondary transition-colors duration-200 ${
                    location.pathname === item.link ? "bg-secondary/30" : ""
                  }`}
                  key={item.text}
                  target={item.isExternal ? "_blank" : undefined}
                >
                  {/* Icon with dynamic active state styling and hover effect */}
                  {React.cloneElement(item.icon, {
                    className: `text-2xl ${
                      location.pathname === item.link
                        ? "text-primary"
                        : "text-text hover:text-primary"
                    }`,
                  })}
                  {/* Menu item text with dynamic active state styling and hover effect */}
                  <span
                    className={`ml-2 text-sm font-medium ${
                      location.pathname === item.link
                        ? "text-primary"
                        : "text-text hover:text-primary"
                    }`}
                  >
                    {item.text}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div />
    </>
  );
};
