export default function Home() {
  return (
    <main className="bg-white">
      {/* Home Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Company</h1>
          <p className="text-xl text-gray-600">Professional services and quality products</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
          <p className="text-lg text-gray-600">Learn more about our company history and values</p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
          <p className="text-lg text-gray-600">Discover our range of quality products</p>
        </div>
      </section>

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
