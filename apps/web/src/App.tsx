import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "@/theme"; // Import useTheme hook
import { About } from "./features/about";
import { Blog } from "./features/blog";
import { Portfolio } from "./features/portfolio";
import { AboutPage } from "./features/about-page";
import { GenAIProjects } from "./features/genai-projects";

const App = () => {
  console.log("App rendered");
  const { themeMode } = useTheme(); // Get current theme mode
  const isDarkMode = themeMode === "dark";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Hero
              title="Shaping Tomorrow's Technology"
              subtitle="Strategic investments and partnerships empowering innovation across the globe"
              isDarkMode={isDarkMode}
              enableMouseTracking={true}
            />
            <InvestmentFocus isDarkMode={isDarkMode} />
            <About isDarkMode={isDarkMode} />
            <Contact isDarkMode={isDarkMode} />
          </Layout>
        } />

        <Route path="/blog" element={
          <Layout>
            <Blog />
          </Layout>
        } />

        <Route path="/portfolio" element={
          <Layout>
            <Portfolio />
          </Layout>
        } />

        <Route path="/about" element={
          <Layout>
            <AboutPage />
          </Layout>
        } />

        <Route path="/projects/genai" element={
          <Layout>
            <GenAIProjects />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
