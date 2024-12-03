import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { LaundryOrder } from '../types';
import { api } from '../api';
import { WEBHOOK_DELIVERED } from '../config';
import toast from 'react-hot-toast';

export default function LaundryTable() {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleDeliveryDateChange = async (orderId: number, date: Date | null) => {
    if (!date) return;

    try {
      await api.updateOrder(orderId, { delivery_date: date.toISOString() });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update delivery date');
    }
  };

  const handleDeliveredChange = async (order: LaundryOrder) => {
    try {
      const updatedOrder = await api.updateOrder(order.id, { 
        delivered: !order.delivered,
        delivery_date: !order.delivered ? new Date().toISOString() : null
      });

      if (!order.delivered) {
        await fetch(WEBHOOK_DELIVERED, {
          method: 'POST',
          body: JSON.stringify({
            delivery_date: updatedOrder.delivery_date,
            villa_name: order.villa_name,
            guest_name: order.guest_name,
            total_garments: order.total_garments
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }

      fetchOrders();
    } catch (error) {
      toast.error('Failed to update delivery status');
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Order Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Villa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Guest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Total Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Delivery Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Delivered
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr 
              key={order.id}
              className={order.delivered ? 'bg-[#b3f9c8]' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {order.order_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.order_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.villa_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.guest_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.total_garments}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <DatePicker
                  selected={order.delivery_date ? new Date(order.delivery_date) : null}
                  onChange={(date) => handleDeliveryDateChange(order.id, date)}
                  dateFormat="dd/MM/yyyy"
                  className="rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={order.delivered}
                  onChange={() => handleDeliveredChange(order)}
                  className="h-4 w-4"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}