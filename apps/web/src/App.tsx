// App.tsx - Remove the ComponentManagerProvider
import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./features/sidebar/components/Sidebar";

const App = () => {
  console.log("App rendered");

  return (
    <BrowserRouter>
      <Layout>
        <Hero />
        <InvestmentFocus />
        <Contact />
      </Layout>
    </BrowserRouter>
  );
};

export default App;
