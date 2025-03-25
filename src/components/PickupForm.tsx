import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Cylinder = Database['public']['Tables']['cylinders']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

interface PickupFormProps {
  customerCylinders: Cylinder[];
  onPickupComplete: () => void;
  onCancel: () => void;
}

const PickupForm: React.FC<PickupFormProps> = ({
  customerCylinders,
  onPickupComplete,
  onCancel,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCylinder, setSelectedCylinder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch customer details when cylinder is selected
    const fetchCustomerDetails = async () => {
      if (!selectedCylinder) {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        return;
      }

      try {
        // Get the most recent delivered order for the selected cylinder
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('cylinder_serial', selectedCylinder)
          .eq('status', 'Delivered')
          .order('order_date', { ascending: false })
          .limit(1)
          .single();

        if (orderError) {
          setCustomerName('');
          setCustomerPhone('');
          setCustomerAddress('');
          throw orderError;
        }

        if (orderData) {
          setCustomerName(orderData.customer_name);
          setCustomerPhone(orderData.customer_phone);
          setCustomerAddress(orderData.customer_address);
        } else {
          setCustomerName('');
          setCustomerPhone('');
          setCustomerAddress('');
          setError('No delivery record found for this cylinder');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Failed to fetch customer details');
      }
    };

    fetchCustomerDetails();
  }, [selectedCylinder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create pickup request
      const { error: pickupError } = await supabase.from('pickups').insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        cylinder_serial: selectedCylinder,
        pickup_status: 'Assigned Pickup',
      });

      if (pickupError) throw pickupError;

      // Update cylinder status
      const { error: cylinderError } = await supabase
        .from('cylinders')
        .update({ status: 'assigned_pickup' })
        .eq('serial_number', selectedCylinder);

      if (cylinderError) throw cylinderError;

      onPickupComplete();
    } catch (err) {
      setError('Failed to create pickup request. Please try again.');
      console.error('Pickup creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">New Pickup Request</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            {customerCylinders.map((cylinder) => (
              <option key={cylinder.serial_number} value={cylinder.serial_number}>
                {cylinder.serial_number} - {cylinder.status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-100"
            required
            readOnly
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
            className="w-full px-3 py-2 border rounded-md bg-gray-100"
            required
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Address
          </label>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-100"
            rows={3}
            required
            readOnly
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
            {loading ? 'Creating Pickup...' : 'Create Pickup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PickupForm;