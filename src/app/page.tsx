import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { SecureBanner } from '@/components/SecureBanner';
import { Features } from '@/components/Features';
import { Stats } from '@/components/Stats';
import { Mission } from '@/components/Mission';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SecureBanner />
      <Features />
      <Stats />
      <Mission />
      <Footer />
    </div>
  );
}
