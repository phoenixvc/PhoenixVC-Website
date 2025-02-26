import React from 'react';

const PreviewArea: React.FC = () => {
  return (
    <main className="preview-area">
      <div className="preview-controls">
        <button className="btn">Desktop</button>
        <button className="btn">Tablet</button>
        <button className="btn">Mobile</button>
      </div>
      <div className="preview-device">
        <div className="preview-header">
          <h1>Preview Area</h1>
        </div>
        <div className="preview-content">
          <div className="component-preview">
            <h2>Button Styles</h2>
            <button className="btn">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-accent">Accent Button</button>
          </div>
          <div className="component-preview">
            <h2>Typography</h2>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>
              Regular paragraph text with <a href="#">links</a> and <strong>bold text</strong>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PreviewArea;
