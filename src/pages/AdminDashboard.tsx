import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder, Users, Package, History, Plus } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const { cylinders, orders, pickups, setCylinders, setOrders, setPickups } = useStore();

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
      // Fetch cylinders
      const { data: cylindersData } = await supabase
        .from('cylinders')
        .select('*')
        .order('serial_number');
      
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      // Fetch pickups
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
    const emptyCylinders = cylinders.filter(c => c.status === 'empty' && c.location === 'Warehouse').length;
    const customerCylinders = cylinders.filter(c => c.location === 'Customer').length;
    const totalCylinders = cylinders.length;

    return { emptyCylinders, customerCylinders, totalCylinders };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cylinder className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Admin Dashboard</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-gray-400" />
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Empty Cylinders
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.emptyCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-gray-400" />
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Cylinders with Customers
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.customerCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-gray-400" />
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Cylinders
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.totalCylinders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
              <button
                onClick={() => setShowOrderForm(true)}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Order
              </button>
              <button
                onClick={() => setShowPickupForm(true)}
                className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Pickup
              </button>
              <button
                onClick={() => setShowUserForm(true)}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </button>
              <button
                onClick={() => setShowCylinderForm(true)}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Cylinder
              </button>
            </div>

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

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
                  <History className="h-5 w-5 mr-2" />
                  Recent Activity
                </h3>

                <div className="space-y-4">
                  {/* Recent Orders */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recent Orders</h4>
                    <div className="bg-gray-50 rounded-lg divide-y">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.order_id} className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-gray-500">{order.customer_phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{order.status}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.order_date!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className="p-4 text-gray-500 text-sm">No recent orders</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Pickups */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recent Pickups</h4>
                    <div className="bg-gray-50 rounded-lg divide-y">
                      {pickups.slice(0, 5).map(pickup => (
                        <div key={pickup.pickup_id} className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{pickup.customer_name}</p>
                              <p className="text-sm text-gray-500">{pickup.customer_phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{pickup.pickup_status}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(pickup.created_at!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {pickups.length === 0 && (
                        <p className="p-4 text-gray-500 text-sm">No recent pickups</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;