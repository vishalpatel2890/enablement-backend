// index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; // Import the main App component
import "./App.css"; // Optional: Include any global styles

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root") // The root DOM node from public/index.html
);
