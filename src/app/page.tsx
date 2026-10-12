import { MOCK_ASESOR } from '@/data/mock-properties';
import { Hero } from '@/components/public/Hero';

export default function HomePage() {
  return <Hero asesor={MOCK_ASESOR} />;
}

