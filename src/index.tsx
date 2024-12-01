/**
 * Main entry point for the React application.
 * This file handles the initial rendering and configuration of the app,
 * including theme management and provider setup.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactWalletsProvider from "./wallet/config";

/**
 * Theme Management
 * Retrieves the user's preferred theme from localStorage.
 * If no theme is set, defaults to 'dark' theme.
 * @type {string}
 */
const preferredTheme = localStorage.getItem("theme") || "dark";

/**
 * Apply the retrieved theme to the document root element.
 * This ensures the theme is applied before the initial render.
 */
document.documentElement.classList.add(preferredTheme);

/**
 * Create the root React DOM node
 * @type {ReactDOM.Root}
 */
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

/**
 * Render the application
 * Wraps the main App component with:
 * - React.StrictMode: For highlighting potential problems in development
 * - ReactWalletsProvider: For wallet connection functionality
 * - ToastContainer: For displaying notifications (auto-closes after 3 seconds)
 */
root.render(
  <React.StrictMode>
    <ReactWalletsProvider>
      <App />
    </ReactWalletsProvider>

    <ToastContainer autoClose={3000} />
  </React.StrictMode>
);

/**
 * Initialize web vitals reporting
 * Measures and reports key performance metrics of the application
 */
reportWebVitals();
