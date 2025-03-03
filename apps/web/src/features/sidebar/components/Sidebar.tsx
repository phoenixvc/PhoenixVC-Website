import { useTheme } from "@/theme"; // Use the theme context
import { ComponentSkin, SidebarProps, SidebarItem } from "../types";
import SidebarContainer from "./SidebarContainer";
import SidebarGroup from "./SidebarGroup";
import SidebarItemComponent from "./SidebarItem";
import { SIDEBAR_LINKS } from "../constants/sidebar.constants";
import { mapThemeColorsToSkin } from "../utils/sidebarUtils"; // Updated utility function to map to ComponentSkin

const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose = () => {},
  items = SIDEBAR_LINKS,
}) => {
  // Access the theme context using the `useTheme` hook
  const { themeName: colorScheme, getAllThemeClasses, themeMode: mode, getComputedThemeStyles } = useTheme();

  // Dynamically retrieve the current theme classes
  const currentThemeClasses = getAllThemeClasses()[colorScheme];

  // Map the theme classes to ComponentSkin
  const sidebarSkin: ComponentSkin = mapThemeColorsToSkin(currentThemeClasses);

  // Handle invalid skin configuration
  if (!currentThemeClasses) {
    console.error("Invalid theme configuration for the current color scheme!");
    return null; // Render nothing if the theme is invalid
  }

  return (
    <SidebarContainer skin={sidebarSkin}>
      {isOpen && (
        <>
          <button onClick={onClose} aria-label="Close Sidebar">
            Close
          </button>
          {items.map((item, index) => {
            switch (item.type) {
              case "group":
                return (
                  <SidebarGroup
                    key={index}
                    title={item.label}
                    items={
                      item.children?.map((child) => ({
                        label: child.label, // Extract label
                        icon: child.icon, // Extract icon if available
                        onClick: child.onClick, // Extract onClick handler if available
                        type: "item", // Specify the type
                        skin: sidebarSkin, // Pass the skin property
                      })) || []
                    }
                    skin={sidebarSkin} // Pass the skin to SidebarGroup
                    mode={mode} // Pass the mode (optional)
                  />
                );
              case "item":
                return (
                  <SidebarItemComponent
                    key={index}
                    label={item.label}
                    skin={sidebarSkin}
                    onClick={item.onClick}
                    icon={item.icon}
                  />
                );
              case "link":
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="sidebar-link"
                    style={{ color: sidebarSkin.colors.surface.background }}
                  >
                    {item.icon && <span className="icon">{item.icon}</span>}
                    {item.label}
                  </a>
                );
              default:
                return assertUnreachable(item);
            }
          })}
        </>
      )}
    </SidebarContainer>
  );
};

export function assertUnreachable(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

export default Sidebar;
