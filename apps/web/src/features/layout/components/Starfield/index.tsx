// index.tsx
import App from "@/App";
import React from "react";
import ReactDOM from "react-dom/client";
import Starfield from "./Starfield";

// Export the main component
export default Starfield;

// Export cosmic hierarchy components - avoid duplicate exports
export * from "./cosmos"; // This already includes the types from cosmos/types

// Export types - avoid re-exporting cosmos/types which is already exported via ./cosmos

// Remove this line to avoid the duplicate export
export * from "./cosmos/types";
export * from "./types";

// Export utility functions
export * from "./blackHoles";
export * from "./planets";
export * from "./stars";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
