"use client";

import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiUserPlus, 
  FiSearch, 
  FiFilter,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiShield,
  FiMail,
  FiClock,
  FiLoader
} from 'react-icons/fi';
import { userService, type User, type UserStats, type UserCreate, type UserUpdate } from '@/lib/api/users';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { UserForm } from '@/components/ui/user-form';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    admin_users: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { showToast } = useToast();

  // Fetch users and stats
  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);

      const [usersData, statsData] = await Promise.all([
        userService.getUsers({
          search: searchTerm || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          limit: 100
        }),
        userService.getUserStats()
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users data'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter]);

  // Handle user deletion
  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully'
      });
      fetchData(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Cancel user deletion
  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId: number) => {
    try {
      await userService.toggleUserStatus(userId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'User status updated successfully'
      });
      fetchData(false);
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user status'
      });
    }
  };

  // Handle opening add user modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Handle opening edit user modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handle form submission
  const handleFormSubmit = async (userData: UserCreate | UserUpdate) => {
    setIsFormLoading(true);
    
    try {
      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser.id, userData as UserUpdate);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'User updated successfully'
        });
      } else {
        // Create new user
        await userService.createUser(userData as UserCreate);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'User created successfully'
        });
      }
      
      handleCloseModal();
      fetchData(false);
    } catch (error) {
      console.error('Error saving user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: selectedUser ? 'Failed to update user' : 'Failed to create user'
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: boolean) => {
    return status 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>
          
          <button 
            onClick={handleAddUser}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiUserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.active_users}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiShield className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-red-600">{stats.admin_users}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiShield className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inactive_users}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiClock className="text-yellow-600" size={24} />
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <FiFilter className="mr-2" />
            {isRefreshing ? (
              <FiLoader className="animate-spin mr-2" size={16} />
            ) : null}
            {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Created</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiMail size={12} className="mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.is_active)}`}>
                      {user.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit user"
                        onClick={() => handleEditUser(user)}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Toggle status"
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        <FiShield size={16} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <FiMoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeleteUser}
        onCancel={cancelDeleteUser}
      />
    </div>
  );
}
