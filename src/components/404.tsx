// NotFoundPage.tsx

import React from "react";
import { Link } from "react-router-dom";

/**
 * NotFoundPage Component
 *
 * A React functional component that renders a 404 error page when users navigate
 * to a non-existent route in the application.
 *
 * Features:
 * - Displays a large "404" heading
 * - Shows a user-friendly error message
 * - Provides an "Explore" button to redirect users to the main exploration page
 *
 * @component
 * @example
 * return (
 *   <NotFoundPage />
 * )
 */
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
