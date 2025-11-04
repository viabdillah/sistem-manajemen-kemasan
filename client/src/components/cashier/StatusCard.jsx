// client/src/components/cashier/StatusCard.jsx
import React from 'react';

// Tentukan warna berdasarkan judul
const colors = {
  "New Orders": "bg-blue-100 text-blue-800",
  "Awaiting Desainer": "bg-yellow-100 text-yellow-800",
  "Process Production": "bg-indigo-100 text-indigo-800",
  "Take Orders": "bg-green-100 text-green-800",
};

const StatusCard = ({ title, count, percentageChange }) => {
  const isPositive = percentageChange >= 0;
  const colorClass = colors[title] || "bg-gray-100 text-gray-800";

  return (
    <div className={`p-6 rounded-xl shadow-lg ${colorClass}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-4xl font-bold">{count}</p>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(percentageChange)}%
        </span>
      </div>
    </div>
  );
};

export default StatusCard;