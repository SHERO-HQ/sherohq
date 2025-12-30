import HeroHeader from '@/components/HeroHeader'
import WhoWeAre from '@/components/WhoWeAre';
import { useTitle } from '@/hooks/useTitle';
import Footer from '@/components/Footer';
import Pillars from '@/components/Pillars';
import Partners from '@/components/Partners';

const HomePage = () => {
    useTitle("Home");
  return (
    <>
    <HeroHeader />
    <Partners/>
    {/* <div className='border-t-2'/> */}
    <WhoWeAre />
    <Pillars />
    <Footer />
    </>
  )
}

export default HomePage