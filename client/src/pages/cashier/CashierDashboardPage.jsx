// client/src/pages/cashier/CashierDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { BsPersonPlusFill, BsPlusCircleFill, BsPeopleFill, BsBoxSeam, BsArrowRight } from 'react-icons/bs';

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg ${colorClass}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium opacity-80">{title}</p>
      <div className="text-3xl opacity-70">{icon}</div>
    </div>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

const CashierDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const response = await fetch('http://localhost:5001/api/kasir/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal mengambil data dashboard');
        const result = await response.json();
        setData(result);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthToken]);

  if (loading) return <div className="p-6">Memuat data dashboard...</div>;
  if (!data) return <div className="p-6 text-red-500">Gagal memuat data.</div>;

  const { stats, recentCustomers } = data;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Kasir</h1>
      
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Pesanan Dibuat (Hari Ini)"
          value={stats.total_orders_today}
          icon={<BsBoxSeam />}
          colorClass="bg-green-100 text-green-800"
        />
        <StatCard 
          title="Total Pelanggan Didaftarkan"
          value={stats.total_customers_registered}
          icon={<BsPeopleFill />}
          colorClass="bg-blue-100 text-blue-800"
        />
      </div>

      {/* Tombol Pintas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/kasir/pesanan/tambah" className="block p-8 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
          <div className="flex items-center gap-4">
            <BsPlusCircleFill size={40} />
            <span className="text-2xl font-bold">Buat Pesanan Baru</span>
          </div>
        </Link>
        <Link to="/kasir/pelanggan/tambah" className="block p-8 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105">
          <div className="flex items-center gap-4">
            <BsPersonPlusFill size={40} />
            <span className="text-2xl font-bold">Tambah Pelanggan Baru</span>
          </div>
        </Link>
      </div>

      {/* Daftar Pelanggan Terbaru */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pelanggan Terbaru Didaftarkan</h2>
          <Link 
            to="/kasir/pelanggan/tambah"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat Semua <BsArrowRight />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. WhatsApp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCustomers.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Belum ada pelanggan yang didaftarkan.</td></tr>
              ) : (
                recentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.whatsapp_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboardPage;