// App.tsx
import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter } from "react-router-dom";
import { useTheme } from "@/theme"; // Import useTheme hook
import { About } from "./features/about";

const App = () => {
  console.log("App rendered");
  const { themeMode } = useTheme(); // Get current theme mode
  const isDarkMode = themeMode === "dark";

  return (
    <BrowserRouter>
      <Layout>
        <Hero
          title="Shaping Tomorrow's Technology"
          subtitle="Strategic investments and partnerships empowering innovation across the globe"
          isDarkMode={isDarkMode}
          enableMouseTracking={true} // This prop needs to be handled in the Hero component
        />
        <InvestmentFocus isDarkMode={isDarkMode} />
        <About isDarkMode={isDarkMode} />
        <Contact isDarkMode={isDarkMode} />
      </Layout>
    </BrowserRouter>
  );
};

export default App;
