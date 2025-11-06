// client/src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  BsPeopleFill,
  BsPersonPlusFill,
  BsBoxSeam,
  BsArrowRight,
} from "react-icons/bs";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Komponen Kartu Statistik (tidak berubah)
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg ${colorClass}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium opacity-80">{title}</p>
      <div className="text-3xl opacity-70">{icon}</div>
    </div>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage, sama seperti di ManageUsersPage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  // 3. Perbarui 'useEffect' (hapus 'await' saat memanggil getAuthToken)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken(); // <-- Hapus 'await', ini sekarang sinkron

        const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal mengambil data dashboard");
        const result = await response.json();
        setData(result);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthToken]); // getAuthToken sekarang adalah dependensi yang stabil

  /**
   * Sisa dari file JSX Anda (StatCard, Tabel Pengguna Baru)
   * sudah benar dan tidak perlu diubah.
   */

  if (loading) return <div className="p-6">Memuat data dashboard...</div>;
  if (!data) return <div className="p-6 text-red-500">Gagal memuat data.</div>;

  const { stats, newUsers } = data;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>

      {/* Kartu Statistik (tidak berubah) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Pengguna"
          value={stats.total_users}
          icon={<BsPeopleFill />}
          colorClass="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Pengguna Menunggu Role"
          value={stats.users_awaiting_role}
          icon={<BsPersonPlusFill />}
          colorClass="bg-yellow-100 text-yellow-800"
        />
        <StatCard
          title="Total Pesanan"
          value={stats.total_orders}
          icon={<BsBoxSeam />}
          colorClass="bg-green-100 text-green-800"
        />
      </div>

      {/* Daftar Pengguna Baru (tidak berubah) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Pengguna Baru Menunggu Role
          </h2>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat Semua <BsArrowRight />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Mendaftar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada pengguna baru.
                  </td>
                </tr>
              ) : (
                newUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    {" "}
                    {/* Ganti key ke _id */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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

export default AdminDashboardPage;
