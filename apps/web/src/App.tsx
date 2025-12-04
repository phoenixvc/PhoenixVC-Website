import { lazy, Suspense } from "react";
import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "@/theme";
import { About } from "./features/about";
import { ErrorBoundary, NotFound } from "./features/error";
import { PageSkeleton } from "@/components/ui/Skeleton";

// Lazy load route-based components for code splitting
const Blog = lazy(() => import("./features/blog").then(m => ({ default: m.Blog })));
const Portfolio = lazy(() => import("./features/portfolio").then(m => ({ default: m.Portfolio })));
const ProjectDetail = lazy(() => import("./features/portfolio/ProjectDetail").then(m => ({ default: m.ProjectDetail })));
const AboutPage = lazy(() => import("./features/about-page").then(m => ({ default: m.AboutPage })));
const ThemeDesigner = lazy(() => import("./features/theme-designer").then(m => ({ default: m.ThemeDesigner })));

// Loading fallback component using skeleton
const PageLoader = ({ isDarkMode = false }: { isDarkMode?: boolean }) => (
  <PageSkeleton isDarkMode={isDarkMode} />
);

const App = () => {
  const { themeMode } = useTheme(); // Get current theme mode
  const isDarkMode = themeMode === "dark";

  return (
    <ErrorBoundary>
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
            <Suspense fallback={<PageLoader isDarkMode={isDarkMode} />}>
              <Blog />
            </Suspense>
          </Layout>
        } />

        <Route path="/portfolio" element={
          <Layout>
            <Suspense fallback={<PageLoader isDarkMode={isDarkMode} />}>
              <Portfolio />
            </Suspense>
          </Layout>
        } />

        <Route path="/portfolio/:projectId" element={
          <Layout>
            <Suspense fallback={<PageLoader isDarkMode={isDarkMode} />}>
              <ProjectDetail />
            </Suspense>
          </Layout>
        } />

          <Route path="/about" element={
            <Layout>
              <Suspense fallback={<PageLoader isDarkMode={isDarkMode} />}>
                <AboutPage />
              </Suspense>
            </Layout>
          } />

          <Route path="/theme-designer" element={
            <Layout>
              <Suspense fallback={<PageLoader isDarkMode={isDarkMode} />}>
                <ThemeDesigner isDarkMode={isDarkMode} />
              </Suspense>
            </Layout>
          } />

          {/* 404 Not Found - must be last */}
          <Route path="*" element={
            <Layout>
              <NotFound />
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
