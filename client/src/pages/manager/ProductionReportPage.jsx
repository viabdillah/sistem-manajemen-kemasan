// client/src/pages/manager/ProductionReportPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { BsSearch, BsDownload } from "react-icons/bs";
import { exportToExcel } from "../../utils/excelExporter.js";

// --- Impor Chart.js (tetap sama) ---
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Komponen getOrderStatusChip (tidak berubah)
const getOrderStatusChip = (status) => {
  switch (status) {
    case "design_queue":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Antrian Desain
        </span>
      );
    case "design_review":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Review Desain
        </span>
      );
    case "production_queue":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Antrian Produksi
        </span>
      );
    case "in_production":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
          Produksi
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};

const ProductionReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  // 3. Perbarui 'fetchData'
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(
        `${API_URL}/api/manager/reports/production`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil laporan produksi");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect pencarian (tidak berubah)
  useEffect(() => {
    const results = orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  // --- 4. PERBAIKAN ESLINT ---
  const chartData = useMemo(() => {
    const statusCounts = {
      design_queue: 0,
      design_review: 0,
      production_queue: 0,
      in_production: 0,
    };
    orders.forEach((order) => {
      // Gunakan operator 'in' untuk keamanan
      if (order.order_status in statusCounts) {
        statusCounts[order.order_status]++;
      }
    });
    return {
      labels: [
        "Antrian Desain",
        "Review Desain",
        "Antrian Produksi",
        "Sedang Produksi",
      ],
      datasets: [
        {
          label: "Jumlah Pesanan",
          data: [
            statusCounts["design_queue"],
            statusCounts["design_review"],
            statusCounts["production_queue"],
            statusCounts["in_production"],
          ],
          backgroundColor: [
            "rgba(250, 204, 21, 0.7)", // yellow-400
            "rgba(245, 158, 11, 0.7)", // amber-500
            "rgba(59, 130, 246, 0.7)", // blue-500
            "rgba(99, 102, 241, 0.7)", // indigo-500
          ],
          borderColor: ["#FACC15", "#F59E0B", "#3B82F6", "#6366F1"],
          borderWidth: 1,
        },
      ],
    };
  }, [orders]);

  // handleExport (tidak berubah)
  const handleExport = () => {
    const dataToExport = filteredOrders.map((order) => ({
      "Nomor Pesanan": order.order_number,
      Pelanggan: order.customer_name,
      Status: order.order_status,
      "Tanggal Masuk": new Date(order.created_at).toLocaleString("id-ID"),
    }));
    exportToExcel(dataToExport, "Laporan_Produksi_Aktif");
  };

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Laporan Produksi Aktif
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl shadow-lg bg-indigo-100 text-indigo-800">
            <p className="text-sm font-medium">
              Total Pesanan Sedang Dikerjakan
            </p>
            <p className="text-4xl font-bold">{orders.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Ringkasan Status
            </h2>
            <div className="w-full max-w-xs mx-auto">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <BsSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Cari (No. Pesanan, Pelanggan)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full md:w-80 bg-gray-100 rounded-lg"
              />
            </div>
            {currentUser?.role_name === "manajer" && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold shadow-lg"
              >
                <BsDownload /> Export ke Excel
              </button>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal Masuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada pesanan aktif.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOrderStatusChip(order.order_status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionReportPage;
