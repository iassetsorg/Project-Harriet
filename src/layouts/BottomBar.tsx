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
import { useHashConnectContext } from "../hashconnect/hashconnect";
import { MdOutlinePublic } from "react-icons/md";
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

  {
    icon: <IoNewspaperOutline className="text-2xl" />,
    text: "About",
    link: "/About",
    isExternal: false,
  },
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

const BottomBar = () => {
  const { state } = useHashConnectContext();
  const filteredMenuItems = menuItems.filter(
    (item) =>
      !(item.text === "Threads" || item.text === "Profile") ||
      state === "Paired"
  );
  const location = useLocation();
  return (
    <div className="md:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-background border-text  p-2 flex justify-around items-center">
        {filteredMenuItems.map((item) => (
          <Link
            to={item.link}
            className={`flex flex-col items-center text-text hover:text-primary focus:text-primary focus:outline-none ${
              location.pathname === item.link ? "text-primary" : ""
            }`}
            key={item.text}
            target={item.isExternal ? "_blank" : undefined}
            title={item.text} // Tooltip added
          >
            {item.icon}
            <span className="text-xs font-medium">{item.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
