import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Package, User, Phone, MapPin, Truck } from 'lucide-react';

interface PickupFormProps {
  customerCylinders: any[];
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
    const fetchCustomerDetails = async () => {
      if (!selectedCylinder) {
        resetForm();
        return;
      }

      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('cylinder_serial', selectedCylinder)
          .eq('status', 'Delivered')
          .order('order_date', { ascending: false })
          .limit(1)
          .single();

        if (orderError) throw orderError;

        if (orderData) {
          setCustomerName(orderData.customer_name);
          setCustomerPhone(orderData.customer_phone);
          setCustomerAddress(orderData.customer_address);
        } else {
          resetForm();
          setError('No delivery record found for this cylinder');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Failed to fetch customer details');
      }
    };

    fetchCustomerDetails();
  }, [selectedCylinder]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: pickupError } = await supabase.from('pickups').insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        cylinder_serial: selectedCylinder,
        pickup_status: 'Assigned Pickup',
      });

      if (pickupError) throw pickupError;

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
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full transform transition-all">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Truck className="h-6 w-6 mr-2" />
            New Pickup Request
          </h2>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cylinder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cylinder
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCylinder}
                onChange={(e) => setSelectedCylinder(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
                disabled={loading}
              >
                <option value="">Select a cylinder for pickup</option>
                {customerCylinders.map((cylinder) => (
                  <option key={cylinder.serial_number} value={cylinder.serial_number}>
                    {cylinder.serial_number} - {cylinder.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Details</h3>
            
            {/* Customer Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={customerName}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Customer name will appear here"
                readOnly
                disabled
              />
            </div>

            {/* Phone Number */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={customerPhone}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Phone number will appear here"
                readOnly
                disabled
              />
            </div>

            {/* Address */}
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={customerAddress}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Address will appear here"
                rows={3}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white 
                ${loading 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                } 
                transition-colors shadow-sm flex items-center`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Pickup...
                </>
              ) : (
                'Create Pickup Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickupForm;