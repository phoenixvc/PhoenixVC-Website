import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import PreviewArea from "./components/PreviewArea/PreviewArea";

const App: React.FC = () => {
  return (
    <div className="configurator-layout">
      <Sidebar />
      <PreviewArea />
    </div>
  );
};

export default App;
