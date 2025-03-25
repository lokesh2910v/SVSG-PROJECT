import React, { useState } from "react";
import { supabase } from "../lib/supabase";

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

    // Ensure serial number is not empty
    if (!serialNo.trim()) {
      setError("Serial number cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from("cylinders").insert([
        {
          serial_number: serialNo.trim(),
          status: "empty", // Must match ENUM values
          location: "Warehouse", // Case-sensitive ENUM value
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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Cylinder</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
          <input
            type="text"
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {loading ? "Adding..." : "Add Cylinder"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CylinderForm;
