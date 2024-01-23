// NotFoundPage.tsx

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className=" text-center  w-full bg-gray-800 0">
      <div className="text-center mx-auto mt-16">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-lg text-gray-300">
          Oops! The page you're looking for isn't here.
        </p>
        <a
          href="/Explore"
          className="inline-flex items-center px-8 py-4 mt-5 text-xl font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
        >
          Explore
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
