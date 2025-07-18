"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeamMemberForm from '@/components/Team/TeamMemberForm';
import { FiArrowLeft, FiLock } from 'react-icons/fi';

interface TeamMemberFormData {
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  department?: string;
  order_position: number;
  is_active: boolean;
  image?: File | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function NewTeamMemberPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token'); // Fixed: using correct key
    }
    return null;
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/sign-in');
        return;
      }

      try {
        // Verify token is still valid
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_token');
          router.push('/auth/sign-in');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        router.push('/auth/sign-in');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateMember = async (formData: TeamMemberFormData) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login to continue');
        router.push('/auth/sign-in');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formDataToSend.append('image', value);
        } else if (value !== null && value !== undefined && key !== 'image') {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/team/with-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('auth_token');
        router.push('/auth/sign-in');
        return;
      }

      if (response.ok) {
        alert('Team member created successfully!');
        router.push('/team');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create team member');
      }
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Failed to create team member: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/team');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLock className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to add team members</p>
          <button
            onClick={() => router.push('/auth/sign-in')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Team Management
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Add New Team Member</h1>
            <p className="text-gray-600 mt-1">Create a new team member profile</p>
          </div>
        </div>

        {/* Form - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <TeamMemberForm
              onSubmit={handleCreateMember}
              onCancel={handleCancel}
              isLoading={isLoading}
              mode="create"
              isModal={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
