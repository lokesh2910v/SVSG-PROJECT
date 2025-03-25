import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder, Users, Package, History, Plus, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import OrderForm from '../components/OrderForm';
import PickupForm from '../components/PickupForm';
import UserForm from '../components/UserForm';
import CylinderForm from '../components/CylinderForm';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCylinderForm, setShowCylinderForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cylinders, orders, pickups, setCylinders, setOrders, setPickups } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Add this new function to filter cylinders
  const filteredCylinders = () => {
    return cylinders.filter((cylinder) => {
      const matchesSearch = cylinder.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || cylinder.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.user_type !== 'Admin') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data: cylindersData } = await supabase
        .from('cylinders')
        .select('*')
        .order('serial_number');
      
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      const { data: pickupsData } = await supabase
        .from('pickups')
        .select('*')
        .order('created_at', { ascending: false });

      if (cylindersData) setCylinders(cylindersData);
      if (ordersData) setOrders(ordersData);
      if (pickupsData) setPickups(pickupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    const filteredCyls = filteredCylinders();
    const emptyCylinders = filteredCyls.filter(c => c.status === 'empty' && c.location === 'Warehouse').length;
    const filledCylinders = filteredCyls.filter(c => c.status === 'filled' && c.location === 'Warehouse').length;
    const customerCylinders = filteredCyls.filter(c => c.location === 'Customer').length;
    const totalCylinders = filteredCyls.length;
  
    return { emptyCylinders, filledCylinders, customerCylinders, totalCylinders };
  };
  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="py-4 flex justify-between items-center border-b">
            <div className="flex items-center">
              <Cylinder className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Admin Dashboard</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>

          {/* Search Bar */}
          <div className="py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cylinders by serial number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchTerm && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {filteredCylinders().length > 0 ? (
                      filteredCylinders().map((cylinder) => (
                        <div 
                          key={cylinder.id} 
                          className="p-3 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                Serial Number: {cylinder.serial_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                Location: {cylinder.location}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cylinder.status === 'empty' ? 'bg-red-100 text-red-800' :
                              cylinder.status === 'filled' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {cylinder.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No cylinders found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside listener */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowSearchResults(false)}
        />
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-50">
                      <Package className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                          Empty
                        </dt>
                        <dd className="text-2xl sm:text-3xl font-bold text-red-600">
                          {stats.emptyCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-50">
                      <Package className="h-7 w-7 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                          Filled
                        </dt>
                        <dd className="text-2xl sm:text-3xl font-bold text-green-600">
                          {stats.filledCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-50">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                          Assigned
                        </dt>
                        <dd className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {stats.customerCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-50">
                      <Package className="h-7 w-7 text-purple-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                          Total
                        </dt>
                        <dd className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {stats.totalCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-6">
            <button
              onClick={() => setShowOrderForm(true)}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">New Order</span>
            </button>
            <button
              onClick={() => setShowPickupForm(true)}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">New Pickup</span>
            </button>
            <button
              onClick={() => setShowUserForm(true)}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Add User</span>
            </button>
            <button
              onClick={() => setShowCylinderForm(true)}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Add Cylinder</span>
            </button>
          </div>
                      {/* History Button */}
                      <div className="mb-6">
              <button
                onClick={() => setShowHistory(true)}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                <span className="text-sm sm:text-base">View Cylinder History</span>
              </button>
            </div>

            {/* History Modal */}
            {showHistory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
                      Cylinder History
                    </h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Search by serial number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Status</option>
                          <option value="empty">Empty</option>
                          <option value="filled">Filled</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>

                      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                        {filteredCylinders().length > 0 ? (
                          filteredCylinders().map((cylinder) => (
                            <div key={cylinder.id} className="p-4 hover:bg-gray-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Serial Number: {cylinder.serial_number}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Location: {cylinder.location}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    cylinder.status === 'empty' ? 'bg-red-100 text-red-800' :
                                    cylinder.status === 'filled' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {cylinder.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No cylinders found matching your criteria
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => {
                        setShowHistory(false);
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Forms */}
            {showOrderForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                  <OrderForm
                    availableCylinders={cylinders.filter(c => c.status === 'empty' && c.location === 'Warehouse')}
                    onOrderComplete={() => {
                      setShowOrderForm(false);
                      fetchData();
                    }}
                    onCancel={() => setShowOrderForm(false)}
                  />
                </div>
              </div>
            )}

            {showPickupForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                  <PickupForm
                    customerCylinders={cylinders.filter(c => c.location === 'Customer' && c.status === 'delivered')}
                    onPickupComplete={() => {
                      setShowPickupForm(false);
                      fetchData();
                    }}
                    onCancel={() => setShowPickupForm(false)}
                  />
                </div>
              </div>
            )}

            {showUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                  <UserForm
                    onUserCreated={() => {
                      setShowUserForm(false);
                      fetchData();
                    }}
                    onCancel={() => setShowUserForm(false)}
                  />
                </div>
              </div>
            )}

            {showCylinderForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                  <CylinderForm
                    onCylinderAdded={() => {
                      setShowCylinderForm(false);
                      fetchData();
                    }}
                    onCancel={() => setShowCylinderForm(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;