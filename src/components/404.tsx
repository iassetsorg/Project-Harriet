// NotFoundPage.tsx

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className=" text-center  w-full bg-background 0">
      <div className="text-center mx-auto mt-16">
        <h1 className="text-6xl font-bold text-text">404</h1>
        <p className="text-lg text-text">
          Oops! The page you're looking for isn't here.
        </p>
        <a
          href="/Explore"
          className="inline-flex items-center px-8 py-4 mt-5 text-xl font-semibold text-background bg-primary rounded-full hover:bg-secondary transition duration-300"
        >
          Explore
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
