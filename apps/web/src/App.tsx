import { lazy, Suspense } from "react";
import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "@/theme";
import { About } from "./features/about";

// Lazy load route-based components for code splitting
const Blog = lazy(() => import("./features/blog").then(m => ({ default: m.Blog })));
const Portfolio = lazy(() => import("./features/portfolio").then(m => ({ default: m.Portfolio })));
const AboutPage = lazy(() => import("./features/about-page").then(m => ({ default: m.AboutPage })));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    color: "var(--color-text-secondary)"
  }}>
    Loading...
  </div>
);

const App = () => {
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
            <Suspense fallback={<PageLoader />}>
              <Blog />
            </Suspense>
          </Layout>
        } />

        <Route path="/portfolio" element={
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Portfolio />
            </Suspense>
          </Layout>
        } />

        <Route path="/about" element={
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <AboutPage />
            </Suspense>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
