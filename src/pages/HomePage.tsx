import ChooseUs from '@/components/Pillars';
import HeroHeader from '@/components/HeroHeader'
import WhoWeAre from '@/components/WhoWeAre';
import { useTitle } from '@/hooks/useTitle';
import Footer from '@/components/Footer';

const HomePage = () => {
    useTitle("Home");
  return (
    <>
    <HeroHeader />
    {/* <div className='border-t-2'/> */}
    <WhoWeAre />
    <ChooseUs />
    <Footer />
    </>
  )
}

export default HomePage