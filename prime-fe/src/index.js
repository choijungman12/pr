import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { HelmetProvider } from "react-helmet-async";
import { CookiesProvider } from "react-cookie";
import "./config/firebaseConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HelmetProvider>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </HelmetProvider>
);

reportWebVitals();
