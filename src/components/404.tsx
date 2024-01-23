// NotFoundPage.tsx

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-lg text-gray-600">
          Oops! The page you're looking for isn't here.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 text-sm font-medium leading-5 text-center text-white uppercase transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
