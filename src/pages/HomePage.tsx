import HeroHeader from '@/components/HeroHeader'
import WhoWeAre from '@/components/WhoWeAre';
import { useTitle } from '@/hooks/useTitle';
import Footer from '@/components/Footer';
import Pillars from '@/components/Pillars';

const HomePage = () => {
    useTitle("Home");
  return (
    <>
    <HeroHeader />
    {/* <div className='border-t-2'/> */}
    <WhoWeAre />
    <Pillars />
    <Footer />
    </>
  )
}

export default HomePage