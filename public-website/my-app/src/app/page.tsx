import HeroBanner from '@/components/HeroBanner';
import AboutUs from '@/components/AboutUs';
import Products from '@/components/Products';
import Services from '@/components/Services';
import News from '@/components/News';

export default function Home() {
  return (
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
      <section id="contact" className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-600">Get in touch with our team</p>
        </div>
      </section>
    </main>
  );
}
