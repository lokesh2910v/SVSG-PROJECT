import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder, RefreshCw, CheckCircle, Package, Users, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

const FillerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { orders, setOrders, cylinders, setCylinders } = useStore();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCylinderDetails, setShowCylinderDetails] = useState(false);
  const [cylinderDetails, setCylinderDetails] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.user_type !== 'Filler') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [ordersResponse, cylindersResponse] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('status', 'Ordered')
          .order('order_date', { ascending: true }),
        supabase
          .from('cylinders')
          .select('*')
          .order('serial_number')
      ]);

      if (ordersResponse.data) setOrders(ordersResponse.data);
      if (cylindersResponse.data) setCylinders(cylindersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCylinders = () => {
    return cylinders.filter((cylinder) => {
      const matchesSearch = cylinder.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || cylinder.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getStatistics = () => {
    const emptyCylinders = cylinders.filter(c => 
      c.status === 'empty' && c.location === 'Warehouse'
    ).length;
    
    const filledCylinders = cylinders.filter(c => 
      c.status === 'filled' && c.location === 'Warehouse'
    ).length;
    
    const customerCylinders = cylinders.filter(c => 
      c.location === 'Customer'
    ).length;
    
    const totalCylinders = cylinders.length;

    return { emptyCylinders, filledCylinders, customerCylinders, totalCylinders };
  };

  const stats = getStatistics();

  const handleCardClick = (filterCondition) => {
    const filteredCyls = filteredCylinders().filter(filterCondition);
    setCylinderDetails(filteredCyls);
    setShowCylinderDetails(true);
  };

  const markAsFilled = async (order: any) => {
    setProcessingOrder(order.order_id);
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'Filled' })
        .eq('order_id', order.order_id);

      if (orderError) throw orderError;

      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({ status: 'filled' })
        .eq('serial_number', order.cylinder_serial);

      if (cylinderError) throw cylinderError;

      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="py-4 flex justify-between items-center border-b">
            <div className="flex items-center">
              <Cylinder className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Filler Dashboard</span>
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

              {/* Search Results */}
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
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-6">
              <div
                onClick={() => handleCardClick(c => c.status === 'empty' && c.location === 'Warehouse')}
                className="flex justify-center items-center p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-red-50 rounded-full">
                    <Package className="w-7 h-7 text-red-600" />
                  </div>
                  <div className="flex-1 ml-4">
                    <dl>
                      <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                        Empty
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {stats.emptyCylinders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(c => c.status === 'filled' && c.location === 'Warehouse')}
                className="flex justify-center items-center p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-50 rounded-full">
                    <Package className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1 ml-4">
                    <dl>
                      <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                        Filled
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {stats.filledCylinders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(c => c.location === 'Customer')}
                className="flex justify-center items-center p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 ml-4">
                    <dl>
                      <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                        Assigned
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {stats.customerCylinders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleCardClick(() => true)}
                className="flex justify-center items-center p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Package className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1 ml-4">
                    <dl>
                      <dt className="mb-1 text-sm font-medium text-gray-500 truncate">
                        Total Cylinders
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {stats.totalCylinders}
                      </dd>
                    </dl>
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

            {/* Orders to Fill */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-5">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                  <RefreshCw className="h-6 w-6 mr-3 text-blue-600" />
                  Orders to Fill
                </h3>

                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <div
                        key={order.order_id}
                        className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-center flex-wrap gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                                <Users className="h-4 w-4 text-blue-600" />
                              </span>
                              <h4 className="text-lg font-medium text-gray-900">
                                {order.customer_name}
                              </h4>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Package className="h-4 w-4 mr-1.5 text-gray-500" />
                                <span>Cylinder: {order.cylinder_serial}</span>
                              </div>
                              <div className="flex items-center">
                                <svg 
                                  className="h-4 w-4 mr-1.5 text-gray-500" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                  />
                                </svg>
                                <span>
                                  {new Date(order.order_date!).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => markAsFilled(order)}
                            disabled={processingOrder === order.order_id}
                            className={`
                              flex items-center px-6 py-2.5 rounded-lg text-sm font-medium
                              transition-all duration-200 shadow-sm
                              ${processingOrder === order.order_id
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 hover:shadow-md'
                              }
                            `}
                          >
                            {processingOrder === order.order_id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span>Mark as Filled</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">
                        No pending orders to fill
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        New orders will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FillerDashboard;