import React from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';

const App: React.FC = () => {
  return (
    <div className="configurator-layout">
      <Sidebar />
      <PreviewArea />
    </div>
  );
};

export default App;
