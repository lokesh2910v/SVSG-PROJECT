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

  const [showCylinderDetails, setShowCylinderDetails] = useState(false);
  const [cylinderDetails, setCylinderDetails] = useState([]);

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

  const handleCardClick = (filterCondition) => {
    const filteredCyls = filteredCylinders().filter(filterCondition);
    setCylinderDetails(filteredCyls);
    setShowCylinderDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="relative bg-white shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center py-4 border-b">
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
                className="p-3 pl-10 w-full text-sm rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchTerm && (
                <div className="overflow-y-auto absolute z-50 mt-2 w-full max-h-96 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="p-2">
                    {filteredCylinders().length > 0 ? (
                      filteredCylinders().map((cylinder) => (
                        <div 
                          key={cylinder.id} 
                          className="p-3 rounded-md transition-colors duration-150 cursor-pointer hover:bg-gray-50"
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

      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 sm:gap-6 lg:grid-cols-4">
              <div
                onClick={() => handleCardClick(c => c.status === 'empty' && c.location === 'Warehouse')}
                className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-50 rounded-full">
                      <Package className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-1 ml-4">
                      <dl>
                        <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                          Empty
                        </dt>
                        <dd className="text-2xl font-bold text-red-600 sm:text-3xl">
                          {stats.emptyCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(c => c.status === 'filled' && c.location === 'Warehouse')}
                className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-50 rounded-full">
                      <Package className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1 ml-4">
                      <dl>
                        <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                          Filled
                        </dt>
                        <dd className="text-2xl font-bold text-green-600 sm:text-3xl">
                          {stats.filledCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(c => c.location === 'Customer')}
                className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1 ml-4">
                      <dl>
                        <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                          Assigned
                        </dt>
                        <dd className="text-2xl font-bold text-blue-600 sm:text-3xl">
                          {stats.customerCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(() => true)}
                className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-50 rounded-full">
                      <Package className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1 ml-4">
                      <dl>
                        <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                          Total Cylinders
                        </dt>
                        <dd className="text-2xl font-bold text-purple-600 sm:text-3xl">
                          {stats.totalCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popup for cylinder details */}
            {showCylinderDetails && (
              <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Cylinder Details</h3>
                    <button
                      onClick={() => setShowCylinderDetails(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
                    {cylinderDetails.length > 0 ? (
                      cylinderDetails.map((cylinder) => (
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
                        No cylinders found
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end p-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowCylinderDetails(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6 sm:gap-6 lg:grid-cols-4">
              <button
                onClick={() => setShowOrderForm(true)}
                className="flex justify-center items-center p-4 text-white bg-blue-600 rounded-lg shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
              >
                <Plus className="mr-2 w-5 h-5" />
                <span className="text-sm sm:text-base">New Order</span>
              </button>
              <button
                onClick={() => setShowPickupForm(true)}
                className="flex justify-center items-center p-4 text-white bg-green-600 rounded-lg shadow-lg transition-all duration-300 hover:bg-green-700 hover:shadow-xl"
              >
                <Plus className="mr-2 w-5 h-5" />
                <span className="text-sm sm:text-base">New Pickup</span>
              </button>
              <button
                onClick={() => setShowUserForm(true)}
                className="flex justify-center items-center p-4 text-white bg-purple-600 rounded-lg shadow-lg transition-all duration-300 hover:bg-purple-700 hover:shadow-xl"
              >
                <Plus className="mr-2 w-5 h-5" />
                <span className="text-sm sm:text-base">Add User</span>
              </button>
              <button
                onClick={() => setShowCylinderForm(true)}
                className="flex justify-center items-center p-4 text-white bg-purple-600 rounded-lg shadow-lg transition-all duration-300 hover:bg-purple-700 hover:shadow-xl"
              >
                <Plus className="mr-2 w-5 h-5" />
                <span className="text-sm sm:text-base">Add Cylinder</span>
              </button>
            </div>

            {/* History Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowHistory(true)}
                className="flex justify-center items-center px-6 py-3 w-full text-white bg-indigo-600 rounded-lg shadow-lg transition-all duration-300 sm:w-auto hover:bg-indigo-700 hover:shadow-xl"
              >
                <ClipboardList className="mr-2 w-5 h-5" />
                <span className="text-sm sm:text-base">View Cylinder History</span>
              </button>
            </div>

            {/* History Modal */}
            {showHistory && (
              <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                      <ClipboardList className="mr-2 w-5 h-5 text-indigo-600" />
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
                      <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                        <input
                          type="text"
                          placeholder="Search by serial number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="p-2 w-full rounded-lg border border-gray-300 sm:w-auto focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  <div className="flex justify-end p-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowHistory(false);
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Forms */}
            {showOrderForm && (
              <div className="flex fixed inset-0 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-md">
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
              <div className="flex fixed inset-0 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-md">
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
              <div className="flex fixed inset-0 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-md">
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
              <div className="flex fixed inset-0 justify-center items-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-md">
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