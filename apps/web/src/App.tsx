// App.tsx - Remove the ComponentManagerProvider
import { Layout } from "@/features/layout";
import { Hero } from "@/features/hero";
import { InvestmentFocus } from "@/features/investment-focus";
import { Contact } from "@/features/contact";
import { BrowserRouter } from "react-router-dom";

const App = () => {
  console.log("App rendered");

  return (
    <BrowserRouter>
      <Layout>
        <Hero
            title="Shaping Tomorrow's Technology"
            subtitle="Strategic investments and partnerships empowering innovation across the globe"
            enableMouseTracking={true} // Set to false to disable mouse tracking
          />
        <InvestmentFocus />
        <Contact />
      </Layout>
    </BrowserRouter>
  );
};

export default App;
