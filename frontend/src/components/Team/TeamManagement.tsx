import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiRefreshCw
} from 'react-icons/fi';
import TeamMemberCard from './TeamMemberCard';
import TeamMemberForm from './TeamMemberForm';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  department?: string;
  image_url?: string;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

interface TeamStats {
  active_members: number;
  total_members: number;
  inactive_members: number;
}

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

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({ active_members: 0, total_members: 0, inactive_members: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Get unique departments
  const departments = [...new Set(members.map(m => m.department).filter(Boolean))];

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesDepartment = !departmentFilter || member.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.is_active) ||
                         (statusFilter === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token'); // Fixed: using correct key
    }
    return null;
  };

  const fetchMembers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token available');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/team/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        console.log('Authentication failed - redirecting to login');
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/sign-in';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        throw new Error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      alert('Failed to load team members');
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/team/stats/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchStats()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleCreateMember = async (formData: TeamMemberFormData) => {
    setActionLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login to continue');
        window.location.href = '/auth/sign-in';
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
        window.location.href = '/auth/sign-in';
        return;
      }

      if (response.ok) {
        await fetchMembers();
        await fetchStats();
        setShowForm(false);
        alert('Team member created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create team member');
      }
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Failed to create team member: ' + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMember = async (formData: TeamMemberFormData) => {
    if (!editingMember) return;
    
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formDataToSend.append('image', value);
        } else if (value !== null && value !== undefined && key !== 'image') {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/team/${editingMember.id}/with-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        await fetchMembers();
        await fetchStats();
        setShowForm(false);
        setEditingMember(null);
        alert('Team member updated successfully!');
      } else {
        throw new Error('Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/team/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchMembers();
        await fetchStats();
        alert('Team member deleted successfully!');
      } else {
        throw new Error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Failed to delete team member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/team/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchMembers();
        await fetchStats();
      } else {
        throw new Error('Failed to toggle member status');
      }
    } catch (error) {
      console.error('Error toggling member status:', error);
      alert('Failed to toggle member status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchMembers(), fetchStats()]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading team members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their information</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_members}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">{stats.active_members}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiUserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Members</p>
              <p className="text-3xl font-bold text-red-600">{stats.inactive_members}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiUserX className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <FiFilter className="mr-2" />
            {filteredMembers.length} of {members.length} members
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-600 mb-4">
            {members.length === 0 
              ? "Get started by adding your first team member"
              : "Try adjusting your search filters"
            }
          </p>
          {members.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onToggleStatus={handleToggleStatus}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TeamMemberForm
          initialData={editingMember || undefined}
          onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
          onCancel={handleCloseForm}
          isLoading={actionLoading}
          mode={editingMember ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

export default TeamManagement;
