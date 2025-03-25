import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Package, User, Phone, MapPin } from 'lucide-react'; // Import icons

interface OrderFormProps {
  availableCylinders: any[];
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
        .update({ status: 'ordered', location: 'Customer' })
        .eq('serial_number', selectedCylinder);

      if (cylinderError) throw cylinderError;

      onOrderComplete();
    } catch (err: any) {
      setError('Failed to create order. Please try again.');
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full transform transition-all">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Package className="h-6 w-6 mr-2" />
            New Cylinder Order
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
          {/* Customer Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter customer name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter phone number"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter delivery address"
                rows={3}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Cylinder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cylinder
            </label>
            <select
              value={selectedCylinder}
              onChange={(e) => setSelectedCylinder(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={loading}
            >
              <option value="">Select a cylinder</option>
              {availableCylinders.map((cylinder) => (
                <option key={cylinder.serial_number} value={cylinder.serial_number}>
                  {cylinder.serial_number} - {cylinder.status}
                </option>
              ))}
            </select>
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
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
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
                  Creating Order...
                </>
              ) : (
                'Create Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;