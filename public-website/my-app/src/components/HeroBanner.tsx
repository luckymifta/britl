'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroBanner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  image_url: string;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hero banners from API
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/hero-banners/?active_only=true');
        if (!response.ok) {
          throw new Error('Failed to fetch hero banners');
        }
        const data = await response.json();
        setBanners(data.filter((banner: HeroBanner) => banner.is_active));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hero banners:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hero banners');
        setLoading(false);
      }
    };

    fetchHeroBanners();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hero banners...</p>
        </div>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to BRI</h1>
          <p className="text-xl mb-6">Professional Banking Services & Solutions</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Learn More
          </button>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentBanner?.image_url && (
          <Image
            src={`http://localhost:8000${currentBanner.image_url}`}
            alt={currentBanner.title}
            fill
            style={{ objectFit: 'cover' }}
            priority={currentSlide === 0}
            sizes="100vw"
            className="transition-opacity duration-500"
            unoptimized
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {currentBanner.title}
          </h1>
          
          {currentBanner.description && (
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
              {currentBanner.description}
            </p>
          )}
          
          {currentBanner.button_text && (
            <a
              href={currentBanner.button_link || '#'}
              className="inline-flex items-center px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Learn more: ${currentBanner.button_text}`}
            >
              {currentBanner.button_text}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex space-x-3">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Arrow Navigation */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
