import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="border-t-4 border-blue-500 border-solid rounded-full animate-spin h-8 w-8"></div>
    </div>
  );
};

export default Spinner;
