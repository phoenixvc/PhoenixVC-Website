import { Layout } from '@/features/layout';
import { Hero } from '@/features/hero';
import { InvestmentFocus } from '@/features/investment-focus';
import { Contact } from '@/features/contact';

const App = () => {
  return (
    <Layout>
      <Hero />
      <InvestmentFocus />
      <Contact />
    </Layout>
  );
};

export default App;
