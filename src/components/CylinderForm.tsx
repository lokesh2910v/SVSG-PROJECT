import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { X } from 'lucide-react'; // Import X icon for close button

interface CylinderFormProps {
  onCylinderAdded: () => void;
  onCancel: () => void;
}

const CylinderForm: React.FC<CylinderFormProps> = ({ onCylinderAdded, onCancel }) => {
  const [serialNo, setSerialNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!serialNo.trim()) {
      setError("Serial number cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("cylinders").insert([
        {
          serial_number: serialNo.trim(),
          status: "empty",
          location: "Warehouse",
        },
      ]);

      if (insertError) {
        console.error("Insert Error:", insertError);
        throw insertError;
      }

      onCylinderAdded();
    } catch (err: any) {
      console.error("Cylinder addition error:", err);
      setError(`Failed to add cylinder: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Add New Cylinder</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="serialNo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Serial Number
            </label>
            <input
              id="serialNo"
              type="text"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter cylinder serial number"
              required
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
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
              className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                } 
                transition-colors shadow-sm`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </div>
              ) : (
                'Add Cylinder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CylinderForm;