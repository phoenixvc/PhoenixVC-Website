import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./features/sidebar/components/Sidebar";
import { ComponentThemeRegistry } from "./theme/core/component-theme-registry";
import { ThemeComponentManager } from "./theme/core/component-theme-manager";
import { ComponentManagerProvider } from "./theme/core/component-manager-provider";

const App = () => {
  console.log("App rendered");

  // Create your registry and component manager
  const registry: ComponentThemeRegistry = { /* your registry data */ };
  const componentManager = new ThemeComponentManager(registry);

  return (
    <ComponentManagerProvider manager={componentManager}>
      <BrowserRouter>
        <Layout>
          <Sidebar isOpen={false} onClose={function (): void {
            throw new Error("Function not implemented.");
          } } items={[]}/>
          <Hero />
          <InvestmentFocus />
          <Contact />
        </Layout>
      </BrowserRouter>
    </ComponentManagerProvider>
  );
};

export default App;
