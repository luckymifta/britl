import HeroBanner from '@/components/HeroBanner';
import AboutUs from '@/components/AboutUs';
import Products from '@/components/Products';
import Services from '@/components/Services';
import News from '@/components/News';
import ContactUs from '@/components/ContactUs';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <main className="bg-white">
        {/* Hero Banner Section */}
        <HeroBanner />

        {/* About Section */}
        <AboutUs />

        {/* Products Section */}
        <Products />

        {/* Services Section */}
        <Services />

        {/* News Section */}
        <News />

        {/* Contact Section */}
        <ContactUs />
      </main>

      {/* Footer Section */}
      <Footer />
    </>
  );
}
