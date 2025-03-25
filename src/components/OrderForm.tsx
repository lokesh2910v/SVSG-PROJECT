import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Cylinder = Database['public']['Tables']['cylinders']['Row'];

interface OrderFormProps {
  availableCylinders: Cylinder[];
  onOrderComplete: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  availableCylinders,
  onOrderComplete,
  onCancel,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCylinder, setSelectedCylinder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create new order
      const { error: orderError } = await supabase.from('orders').insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        cylinder_serial: selectedCylinder,
        status: 'Ordered',
      });

      if (orderError) throw orderError;

      // Update cylinder status
      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({ status: 'ordered' ,location:'Customer'})
        .eq('serial_number', selectedCylinder);

      if (cylinderError) throw cylinderError;

      onOrderComplete();
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">New Cylinder Order</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address
          </label>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Cylinder
          </label>
          <select
            value={selectedCylinder}
            onChange={(e) => setSelectedCylinder(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select a cylinder</option>
            {availableCylinders.map((cylinder) => (
              <option key={cylinder.serial_number} value={cylinder.serial_number}>
                {cylinder.serial_number} - {cylinder.status}
              </option>
            ))}
          </select>
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
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;