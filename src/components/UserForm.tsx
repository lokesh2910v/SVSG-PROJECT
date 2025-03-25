import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, User, Mail, Lock, UserCog } from 'lucide-react';

interface UserFormProps {
  onUserCreated: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'Admin' | 'Dispatcher'>('Dispatcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: createError } = await supabase.from('users').insert({
        name,
        email,
        password, // Note: In production, ensure password is properly hashed
        user_type: userType,
      });

      if (createError) throw createError;

      onUserCreated();
    } catch (err) {
      setError('Failed to create user. Please try again.');
      console.error('User creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full transform transition-all">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserCog className="h-6 w-6 mr-2" />
            Create New User
          </h2>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter user's full name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter email address"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter secure password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCog className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'Admin' | 'Dispatcher')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
              >
                <option value="Dispatcher">Dispatcher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white 
                ${loading 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                } 
                transition-colors shadow-sm flex items-center`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating User...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;