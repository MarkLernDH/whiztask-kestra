import { Button } from '@/components/ui/button';
import AuthButton from '@/components/auth/auth-button';
import { HeroSection } from '@/components/sections/hero';
import { TrendingAutomations } from '@/components/sections/trending-automations';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrendingAutomations />
    </main>
  );
}
