import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import HashConnectProvider from "./hashconnect/hashconnect";
import SingingProvider from "./hashconnect/sign";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Detect user's theme preference from localStorage or default to dark mode
const preferredTheme = localStorage.getItem("darkMode") || "false";

// Apply the preferred theme by adding the appropriate class to the <html> element
if (preferredTheme === "true") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <SingingProvider>
      <HashConnectProvider>
        <App />
      </HashConnectProvider>
    </SingingProvider>
    <ToastContainer autoClose={3000} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
