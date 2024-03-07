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
import { useHashConnectContext } from "../hashconnect/hashconnect";

const menuItems = [
  {
    icon: <MdExplore className="text-2xl" />,
    text: "Explore",
    link: "/Explore",
    isExternal: false,
  },
  {
    icon: <MdOutlinePublic className="text-2xl" />,
    text: "Planet",
    link: "/Planet",
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

export const Sidebar: FC = () => {
  const { state } = useHashConnectContext();
  const filteredMenuItems = menuItems.filter(
    (item) =>
      !(item.text === "Threads" || item.text === "Profile") ||
      state === "Paired"
  );

  const location = useLocation();

  return (
    <>
      <div className="flex  shadow-lg">
        <div className="flex flex-col items-center overflow-hidden text-text h-screen bg-background">
          <div className="w-full px-2 hidden md:inline">
            <div className="flex flex-col items-center w-full mt-3">
              {/* <h1 className="flex items-center w-full h-12 px-3 mt-2 rounded ">
                <BiMenuAltLeft className="text-2xl" />
                <span className="ml-2 text-sm font-medium  ">Menu</span>
              </h1> */}

              {filteredMenuItems.map((item) => (
                <Link
                  to={item.link}
                  className={`flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-secondary ${
                    location.pathname === item.link ? "bg-secondary" : ""
                  }`}
                  key={item.text}
                  target={item.isExternal ? "_blank" : undefined}
                >
                  {item.icon}
                  <span className="ml-2 text-sm font-medium">{item.text}</span>
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
