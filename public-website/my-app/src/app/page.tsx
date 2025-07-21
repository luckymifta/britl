import HeroBanner from '@/components/HeroBanner';
import AboutUs from '@/components/AboutUs';
import Products from '@/components/Products';

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
      <section id="services" className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600">Professional services tailored to your needs</p>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">News & Updates</h2>
          <p className="text-lg text-gray-600">Stay updated with our latest news and announcements</p>
        </div>
      </section>

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
