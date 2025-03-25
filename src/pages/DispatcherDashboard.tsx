import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder, Truck, ArrowDownCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type Pickup = Database['public']['Tables']['pickups']['Row'];

const DispatcherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { orders, pickups, setOrders, setPickups } = useStore();
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.user_type !== 'Dispatcher') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch filled orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Filled')
        .order('order_date', { ascending: true });

      // Fetch assigned pickups
      const { data: pickupsData } = await supabase
        .from('pickups')
        .select('*')
        .eq('pickup_status', 'Assigned Pickup')
        .order('created_at', { ascending: true });

      if (ordersData) setOrders(ordersData);
      if (pickupsData) setPickups(pickupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (order: Order) => {
    setProcessingItem(order.order_id);
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'Delivered' })
        .eq('order_id', order.order_id);

      if (orderError) throw orderError;

      // Update cylinder status and location
      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({
          status: 'delivered',
          location: 'Customer'
        })
        .eq('serial_number', order.cylinder_serial);

      if (cylinderError) throw cylinderError;

      fetchData();
    } catch (error) {
      console.error('Error updating delivery:', error);
    } finally {
      setProcessingItem(null);
    }
  };

  const markAsPickedUp = async (pickup: Pickup) => {
    setProcessingItem(pickup.pickup_id);
    try {
      // Update pickup status
      const { error: pickupError } = await supabase
        .from('pickups')
        .update({ pickup_status: 'Pickup Done' })
        .eq('pickup_id', pickup.pickup_id);

      if (pickupError) throw pickupError;

      // Update cylinder status and location
      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({
          status: 'empty',
          location: 'Warehouse'
        })
        .eq('serial_number', pickup.cylinder_serial);

      if (cylinderError) throw cylinderError;

      fetchData();
    } catch (error) {
      console.error('Error updating pickup:', error);
    } finally {
      setProcessingItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cylinder className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Dispatcher Dashboard</span>
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
          <div className="px-4 py-6 sm:px-0 space-y-6">
            {/* Deliveries Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
                  <Truck className="h-5 w-5 mr-2" />
                  Pending Deliveries
                </h3>

                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <div
                        key={order.order_id}
                        className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            Phone: {order.customer_phone}
                          </p>
                          <p className="text-sm text-gray-500">{order.customer_address}</p>
                          <p className="text-sm text-gray-500">
                            Cylinder: {order.cylinder_serial}
                          </p>
                        </div>
                        <button
                          onClick={() => markAsDelivered(order)}
                          disabled={processingItem === order.order_id}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingItem === order.order_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Delivered
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No pending deliveries
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pickups Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
                  <ArrowDownCircle className="h-5 w-5 mr-2" />
                  Pending Pickups
                </h3>

                <div className="space-y-4">
                  {pickups.length > 0 ? (
                    pickups.map(pickup => (
                      <div
                        key={pickup.pickup_id}
                        className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{pickup.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            Cylinder: {pickup.cylinder_serial}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {pickup.customer_phone}
                          </p>
                          <p className="text-sm text-gray-500">{pickup.customer_address}</p>
                        </div>
                        <button
                          onClick={() => markAsPickedUp(pickup)}
                          disabled={processingItem === pickup.pickup_id}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingItem === pickup.pickup_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Picked Up
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No pending pickups
                    </p>
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

export default DispatcherDashboard;