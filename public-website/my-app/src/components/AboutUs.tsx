'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompanyInfo {
  id: number;
  name: string;
  description: string;
  mission: string;
  vision: string;
  values: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded_year: number;
  logo_url: string | null;
  about_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  department: string;
  is_active: boolean;
  order_position: number;
  image_url: string;
  created_at: string;
  updated_at?: string;
}

export default function AboutUs() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/company/');
        if (!response.ok) {
          throw new Error('Failed to fetch company information');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/team/');
        if (!response.ok) {
          throw new Error('Failed to fetch team information');
        }
        const data = await response.json();
        // Sort by order_position and filter active members
        const activeTeam = data
          .filter((member: TeamMember) => member.is_active)
          .sort((a: TeamMember, b: TeamMember) => a.order_position - b.order_position);
        setTeam(activeTeam);
      } catch (err) {
        console.error('Error fetching team:', err);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchCompanyInfo(), fetchTeam()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Auto-slide effect for team members
  useEffect(() => {
    if (team.length > 1) {
      const timer = setInterval(() => {
        setCurrentMemberIndex((prevIndex) => 
          prevIndex === team.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change every 4 seconds

      return () => clearInterval(timer);
    }
  }, [team.length]);

  // Navigation functions for team slideshow
  const nextMember = () => {
    setCurrentMemberIndex((prevIndex) => 
      prevIndex === team.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevMember = () => {
    setCurrentMemberIndex((prevIndex) => 
      prevIndex === 0 ? team.length - 1 : prevIndex - 1
    );
  };

  const goToMember = (index: number) => {
    setCurrentMemberIndex(index);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading company information: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!company) {
    return null;
  }

  // Parse values into an array
  const coreValues = company.values.split(', ').map((value: string) => value.trim());

  return (
    <section id="about" className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Main About Section */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <span className="text-gray-900">About</span> <span className="text-blue-700">{company.name}</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-8"></div>
          </div>

          {/* Company Overview */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <div className="text-base md:text-lg text-gray-700 leading-relaxed space-y-4">
                  {company.description.split('\r\n\r\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph.trim()}</p>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{company.founded_year}</div>
                  <div className="text-sm text-gray-600 font-medium">Founded</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">7+</div>
                  <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative h-96">
                  <Image
                    src="/images/logo/visimisi1.png"
                    alt={`${company.name} Vision & Mission`}
                    fill
                    className="object-contain p-8"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-xl font-bold text-white">{company.name}</h4>
                    <p className="text-blue-100 text-sm mt-2"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision, Mission, Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">{company.vision}</p>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">{company.mission}</p>
              </div>
            </div>

            {/* Values */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                <div className="space-y-2">
                  {coreValues.map((value: string, index: number) => (
                    <span 
                      key={index}
                      className="inline-block bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Slideshow */}
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto"></div>
            </div>
            
            {team.length > 0 ? (
              <div className="relative max-w-2xl mx-auto">
                {/* Team Member Display */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <Image
                      src={`http://localhost:8000${team[currentMemberIndex].image_url}`}
                      alt={team[currentMemberIndex].name}
                      fill
                      className="object-cover rounded-full border-4 border-blue-100"
                    />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {team[currentMemberIndex].name}
                  </h4>
                  
                  <p className="text-lg text-blue-600 font-semibold mb-2">
                    {team[currentMemberIndex].position}
                  </p>
            
                </div>

                {/* Navigation Controls */}
                {team.length > 1 && (
                  <div className="flex justify-between items-center mt-8">
                    {/* Previous Button */}
                    <button 
                      onClick={prevMember}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex space-x-2">
                      {team.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToMember(index)}
                          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                            index === currentMemberIndex 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <button 
                      onClick={nextMember}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <p>No team members available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
