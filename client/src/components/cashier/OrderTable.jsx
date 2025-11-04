// client/src/components/cashier/OrderTable.jsx
import React from 'react';

// Helper untuk style chip status
const getStatusChip = (status) => {
  switch (status) {
    case 'pending':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Pending</span>;
    case 'design_queue':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu Desain</span>;
    case 'design_review':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Review Desain</span>;
    case 'production_queue':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Produksi</span>;
    case 'completed':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
    case 'cancelled':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
    default:
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const OrderTable = ({ orders }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pesanan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.category || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                Rp {Number(order.total_amount).toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(order.order_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{order.payment_status || 'pending'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStatusChip(order.order_status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;