import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type UserType = Database['public']['Tables']['users']['Row']['user_type'];

interface UserFormProps {
  onUserCreated: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('Filler');
  const [age, setAge] = useState('');
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
        password,
        user_type: userType,
        age: parseInt(age, 10),
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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New User</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Type
          </label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="Filler">Filler</option>
            <option value="Dispatcher">Dispatcher</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            min="18"
            max="100"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;