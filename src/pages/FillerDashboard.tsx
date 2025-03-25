import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cylinder, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];

const FillerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { orders, setOrders } = useStore();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.user_type !== 'Filler') {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Ordered')
        .order('order_date', { ascending: true });

      if (data) setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsFilled = async (order: Order) => {
    setProcessingOrder(order.order_id);
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'Filled' })
        .eq('order_id', order.order_id);

      if (orderError) throw orderError;

      // Update cylinder status
      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({ status: 'filled' })
        .eq('serial_number', order.cylinder_serial);

      if (cylinderError) throw cylinderError;

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cylinder className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Filler Dashboard</span>
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
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            {/* Orders to Fill */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Orders to Fill
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
                            Cylinder: {order.cylinder_serial}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ordered: {new Date(order.order_date!).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => markAsFilled(order)}
                          disabled={processingOrder === order.order_id}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingOrder === order.order_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Filled
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No pending orders to fill
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

export default FillerDashboard;