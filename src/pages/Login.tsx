import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      redirectBasedOnUserType(userData.user_type);
    }
  }, [setUser, navigate]);

  const redirectBasedOnUserType = (userType: string) => {
    switch (userType) {
      case 'Admin':
        navigate('/admin');
        break;
      case 'Filler':
        navigate('/filler');
        break;
      case 'Dispatcher':
        navigate('/dispatcher');
        break;
      default:
        navigate('/login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (queryError) {
        throw new Error('Invalid credentials');
      }

      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        redirectBasedOnUserType(data.user_type);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Cylinder className="w-16 h-16 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Oxygen Cylinder Management</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* <div className="mt-6 text-center text-sm text-gray-600">
          Demo Accounts:
          <div className="mt-2 space-y-1">
            <p>Admin: admin@example.com / admin123</p>
            <p>Filler: filler@example.com / filler123</p>
            <p>Dispatcher: dispatcher@example.com / dispatch123</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;