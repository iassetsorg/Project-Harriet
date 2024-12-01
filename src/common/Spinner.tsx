/**
 * Spinner is a simple loading indicator component that displays a rotating circle.
 * Features:
 * - Centered positioning
 * - Smooth animation
 * - Consistent sizing
 * - Primary color theme integration
 */

import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center w-full justify-center h-16">
      <div className="border-t-4 border-primary border-solid rounded-full animate-spin h-8 w-8"></div>
    </div>
  );
};

export default Spinner;
