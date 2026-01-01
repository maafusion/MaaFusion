import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';

const Index = () => {
  return (
    <Layout seamless>
      <HeroSection />
      <FeaturedSection />
      <StatsSection />
    </Layout>
  );
};

export default Index;
