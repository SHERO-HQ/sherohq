import HeroHeader from '@/components/HeroHeader'
import WhoWeAre from '@/components/WhoWeAre';
import { useTitle } from '@/hooks/useTitle';
import Footer from '@/components/Footer';
import Pillars from '@/components/Pillars';
import Partners from '@/components/Partners';
import ThreePathCTA from '@/components/ThreeCTA';
import Stats from '@/components/Stas';
import ProductShowcase from '@/components/ProductShowCase';
import ComingSoonServices from '@/components/ComingSoonServices';

const HomePage = () => {
    useTitle("Home");
  return (
    <>
    <HeroHeader />
    <Partners/>
    {/* <div className='border-t-2'/> */}
    <WhoWeAre />
    <ThreePathCTA />
    <Pillars />
    <Stats />
    <ProductShowcase />
    <ComingSoonServices />
    <Footer />
    </>
  )
}

export default HomePage