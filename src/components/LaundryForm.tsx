import React, { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { VILLAS, GARMENT_TYPES, WEBHOOK_NEW_ORDER } from '../config';
import { api } from '../api';
import toast from 'react-hot-toast';

export default function LaundryForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    villa_name: '',
    guest_name: '',
    ...Object.fromEntries(GARMENT_TYPES.map(type => [type.key, 0])),
    notes: ''
  });

  const totalGarments = GARMENT_TYPES.reduce((sum, type) => 
    sum + (formData[type.key] || 0), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        total_garments: totalGarments,
      };

      // Save to database
      const order = await api.createOrder(orderData);

      // Send to webhook
      await fetch(WEBHOOK_NEW_ORDER, {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Content-Type': 'application/json' }
      });

      toast.success('Order submitted successfully!');
      
      // Reset form
      setFormData({
        villa_name: '',
        guest_name: '',
        ...Object.fromEntries(GARMENT_TYPES.map(type => [type.key, 0])),
        notes: ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">New Laundry Order</h2>
        
        {/* Villa Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Villa *</label>
          <div className="flex gap-4 flex-wrap">
            {VILLAS.map((villa) => (
              <label key={villa} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="villa_name"
                  value={villa}
                  checked={formData.villa_name === villa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    villa_name: e.target.value
                  }))}
                  required
                />
                <span>{villa}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Guest Name */}
        <div>
          <label className="block text-sm font-medium">Guest Name *</label>
          <input
            type="text"
            value={formData.guest_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              guest_name: e.target.value
            }))}
            required
            className="mt-1 block w-full rounded-md"
          />
        </div>

        {/* Garment Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GARMENT_TYPES.map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <label className="text-sm font-medium">{label}</label>
              <input
                type="number"
                min="0"
                value={formData[key]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0
                }))}
                className="w-20 rounded-md"
              />
            </div>
          ))}
        </div>

        {/* Total Garments */}
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-blue-900">
            Total Garments: {totalGarments}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            placeholder="Any special instructions or notes..."
            className="mt-1 block w-full rounded-md"
            rows={3}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#eb5e55] hover:bg-[#d54a41] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb5e55] disabled:bg-[#f5a6a1]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Submitting...
          </>
        ) : (
          'Submit Order'
        )}
      </button>
    </form>
  );
}