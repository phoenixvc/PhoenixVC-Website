import React, { useState } from 'react';

const themeOptions = [
  { theme: 'default', title: 'Default', description: 'Clean and minimal' },
  { theme: 'dark', title: 'Dark', description: 'Modern dark mode' },
  { theme: 'modern', title: 'Modern', description: 'Bold and vibrant' }
];

const Sidebar: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [primaryColor, setPrimaryColor] = useState('#3498db');
  const [secondaryColor, setSecondaryColor] = useState('#2ecc71');
  const [accentColor, setAccentColor] = useState('#e74c3c');
  const [radius, setRadius] = useState('4px');
  const [spacing, setSpacing] = useState('8px');
  const [animationSpeed, setAnimationSpeed] = useState('0.3s');

  const applySettings = () => {
    // Apply theme selection
    document.body.dataset.theme = activeTheme;
    // Update CSS variables on the root element
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--radius-sm', radius);
    document.documentElement.style.setProperty('--radius-md', `calc(${radius} * 2)`);
    document.documentElement.style.setProperty('--spacing-unit', spacing);
    document.documentElement.style.setProperty('--animation-speed', animationSpeed);
  };

  const exportSettings = () => {
    const settings = {
      theme: activeTheme,
      colors: {
        primary: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim(),
        secondary: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-secondary')
          .trim(),
        accent: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent')
          .trim()
      },
      layout: {
        radius: getComputedStyle(document.documentElement)
          .getPropertyValue('--radius-sm')
          .trim(),
        spacing: getComputedStyle(document.documentElement)
          .getPropertyValue('--spacing-unit')
          .trim()
      },
      animation: {
        speed: getComputedStyle(document.documentElement)
          .getPropertyValue('--animation-speed')
          .trim()
      }
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="sidebar">
      <div className="config-section">
        <h2>Theme Selection</h2>
        <div className="theme-selector">
          {themeOptions.map((option) => (
            <div
              key={option.theme}
              className={`theme-option ${activeTheme === option.theme ? 'active' : ''}`}
              onClick={() => setActiveTheme(option.theme)}
              data-theme={option.theme}
            >
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="config-section">
        <h2>Color Customization</h2>
        <div className="color-picker">
          <div className="color-option">
            <div className="color-preview" style={{ background: primaryColor }}></div>
            <div className="input-group">
              <label>Primary Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
          </div>
          <div className="color-option">
            <div className="color-preview" style={{ background: secondaryColor }}></div>
            <div className="input-group">
              <label>Secondary Color</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
          </div>
          <div className="color-option">
            <div className="color-preview" style={{ background: accentColor }}></div>
            <div className="input-group">
              <label>Accent Color</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="config-section">
        <h2>Layout Settings</h2>
        <div className="input-group">
          <label>Border Radius</label>
          <select value={radius} onChange={(e) => setRadius(e.target.value)}>
            <option value="0">Sharp</option>
            <option value="4px">Subtle</option>
            <option value="8px">Rounded</option>
            <option value="16px">Very Rounded</option>
          </select>
        </div>
        <div className="input-group">
          <label>Spacing Scale</label>
          <select value={spacing} onChange={(e) => setSpacing(e.target.value)}>
            <option value="4px">Compact</option>
            <option value="8px">Normal</option>
            <option value="12px">Comfortable</option>
          </select>
        </div>
      </div>
      <div className="config-section">
        <h2>Animation Settings</h2>
        <div className="input-group">
          <label>Animation Speed</label>
          <select value={animationSpeed} onChange={(e) => setAnimationSpeed(e.target.value)}>
            <option value="0">None</option>
            <option value="0.2s">Fast</option>
            <option value="0.3s">Normal</option>
            <option value="0.5s">Slow</option>
          </select>
        </div>
      </div>
      <button className="btn" onClick={applySettings}>Apply Changes</button>
      <button className="btn btn-secondary" onClick={exportSettings}>Export Theme</button>
    </aside>
  );
};

export default Sidebar;
