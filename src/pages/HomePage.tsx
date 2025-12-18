import HeroHeader from '@/components/HeroHeader'
import { useTitle } from '@/hooks/useTitle';

const HomePage = () => {
    useTitle("Home");
  return (
    <>
    <HeroHeader />
    </>
  )
}

export default HomePage