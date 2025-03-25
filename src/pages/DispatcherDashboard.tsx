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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <nav className="bg-white shadow-md sticky top-0 z-10 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Cylinder className="w-10 h-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">Dispatcher Dashboard</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto py-8 px-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Deliveries Section */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
              <Truck className="h-6 w-6 mr-2 text-blue-500" />
              Pending Deliveries
            </h3>

            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map(order => (
                  <div
                    key={order.order_id}
                    className="bg-blue-50 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium text-lg text-gray-800">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">Phone: {order.customer_phone}</p>
                      <p className="text-sm text-gray-600">{order.customer_address}</p>
                      <p className="text-sm text-gray-700 font-medium">Cylinder: {order.cylinder_serial}</p>
                    </div>
                    <button
                      onClick={() => markAsDelivered(order)}
                      disabled={processingItem === order.order_id}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                    >
                      {processingItem === order.order_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Mark as Delivered
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No pending deliveries</p>
              )}
            </div>
          </div>

          {/* Pickups Section */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
              <ArrowDownCircle className="h-6 w-6 mr-2 text-blue-500" />
              Pending Pickups
            </h3>

            <div className="space-y-4">
              {pickups.length > 0 ? (
                pickups.map(pickup => (
                  <div
                    key={pickup.pickup_id}
                    className="bg-blue-50 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium text-lg text-gray-800">{pickup.customer_name}</p>
                      <p className="text-sm text-gray-600">Cylinder: {pickup.cylinder_serial}</p>
                      <p className="text-sm text-gray-600">Phone: {pickup.customer_phone}</p>
                      <p className="text-sm text-gray-700 font-medium">{pickup.customer_address}</p>
                    </div>
                    <button
                      onClick={() => markAsPickedUp(pickup)}
                      disabled={processingItem === pickup.pickup_id}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                    >
                      {processingItem === pickup.pickup_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Mark as Picked Up
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No pending pickups</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  </div>

  );
};

export default DispatcherDashboard;