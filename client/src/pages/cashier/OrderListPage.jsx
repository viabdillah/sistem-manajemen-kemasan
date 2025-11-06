// client/src/pages/cashier/OrderListPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import StatusCard from "../../components/cashier/StatusCard.jsx";
import {
  BsPlusCircleFill,
  BsSearch,
  BsDownload,
  BsEyeFill,
  BsCashCoin,
  BsTrash,
} from "react-icons/bs";
import PaymentModal from "../../components/cashier/PaymentModal.jsx";
import { exportToExcel } from "../../utils/excelExporter.js";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- (Komponen OrderTable dan helper chip status) ---
// (Tidak ada 'fetch' di dalam komponen ini, jadi tidak perlu diubah)
const getOrderStatusChip = (status) => {
  // ... (Logika chip status Anda sudah benar)
  switch (status) {
    case "pending":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          Pending
        </span>
      );
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
    case "completed":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Siap Ambil
        </span>
      );
    case "cancelled":
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 line-through">
          Batal
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
const getPaymentStatusChip = (status) => {
  // ... (Logika chip status Anda sudah benar)
  switch (status) {
    case "paid":
      return <span className="text-xs font-medium text-green-600">Lunas</span>;
    case "pending":
      return (
        <span className="text-xs font-medium text-red-600">Belum Lunas</span>
      );
    default:
      return (
        <span className="text-xs font-medium text-gray-600">{status}</span>
      );
  }
};

const OrderTable = ({ orders, onPayClick, onCancelClick, userRole }) => {
  return (
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
              Harga
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tgl. Pesan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status Bayar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const isReadyForPayment =
              order.order_status === "completed" &&
              order.payment_status === "pending";
            const isCancellable =
              order.order_status !== "completed" &&
              order.order_status !== "cancelled";
            return (
              // --- 5. PERTAHANKAN 'order.order_id' ---
              // Data Anda tampaknya menggunakan order_id, bukan _id. Kita ikuti.
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.customer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  Rp {Number(order.total_amount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(order.order_date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentStatusChip(order.payment_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getOrderStatusChip(order.order_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {isReadyForPayment && (
                    <button
                      onClick={() => onPayClick(order)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-green-700"
                    >
                      <BsCashCoin /> Bayar
                    </button>
                  )}
                  <Link
                    to={`/kasir/pesanan/${order.order_id}/invoice`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200"
                  >
                    <BsEyeFill /> Invoice
                  </Link>
                  {userRole === "admin_sistem" && isCancellable && (
                    <button
                      onClick={() => onCancelClick(order)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200"
                    >
                      <BsTrash /> Batal
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
// --- Akhir Komponen Tabel ---

const OrderListPage = () => {
  // (state)
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    setError(null);
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/kasir/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data pesanan");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // (useEffect pencarian, summaryData, modal handlers... tetap sama)
  useEffect(() => {
    if (!orders) return; // Penjaga
    const results = orders.filter(
      (order) =>
        (order.order_number &&
          order.order_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (order.customer_name &&
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  const summaryData = useMemo(() => {
    if (!orders) return {}; // Penjaga
    return {
      newOrders: orders.filter((o) => o.order_status === "pending").length,
      awaitingDesigner: orders.filter(
        (o) =>
          o.order_status === "design_queue" ||
          o.order_status === "design_review"
      ).length,
      processProduction: orders.filter(
        (o) =>
          o.order_status === "production_queue" ||
          o.order_status === "in_production"
      ).length,
      takeOrders: orders.filter(
        (o) => o.order_status === "completed" && o.payment_status === "pending"
      ).length,
    };
  }, [orders]);

  const handleOpenPayModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // 4. Perbarui 'handleProcessPayment'
  const handleProcessPayment = async (orderId) => {
    // Fungsi ini sekarang HANYA dipanggil oleh modal,
    // jadi kita bisa mengasumsikan token akan diambil di dalam modal
    // atau kita ambil di sini. Mari kita ambil di sini untuk keamanan.
    const token = getAuthToken(); // <-- Hapus 'await'

    // Perbarui panggilan fetch
    const response = await fetch(`${API_URL}/api/kasir/pay/${orderId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal memproses");

    fetchData();
    navigate(`/kasir/pesanan/${orderId}/invoice`);
  };

  // 4. Perbarui 'handleCancelOrder'
  const handleCancelOrder = async (order) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p>
            Anda yakin ingin membatalkan pesanan{" "}
            <strong>{order.order_number}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const toastId = toast.loading("Membatalkan pesanan...");
                try {
                  const token = getAuthToken(); // <-- Hapus 'await'

                  const response = await fetch(
                    `${API_URL}/api/admin/orders/${order.order_id}/cancel`,
                    {
                      method: "PUT",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.message || "Gagal");

                  toast.success(data.message, { id: toastId });
                  fetchData();
                } catch (err) {
                  toast.error(err.message, { id: toastId });
                }
              }}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold"
            >
              Ya, Batalkan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg font-semibold"
            >
              Batal S{" "}
            </button>
          </div>
        </div>
      ),
      { duration: 60000 }
    );
  };

  // 5. Perbarui 'handleExport'
  const handleExport = async () => {
    // (logika pengecekan tidak berubah)
    if (currentUser?.role_name !== "manajer") {
      toast.error("Hanya Manajer yang dapat mengekspor laporan.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error(
        "Silakan pilih rentang waktu (Tanggal Mulai dan Tanggal Akhir) terlebih dahulu."
      );
      return;
    }

    const toastId = toast.loading("Mengambil data untuk ekspor...");
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const url = new URL(`${API_URL}/api/manager/reports/orders/export`);
      url.searchParams.append("startDate", startDate);
      url.searchParams.append("endDate", endDate);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal mengambil data ekspor");
      if (data.length === 0) {
        toast.error("Tidak ada data di rentang waktu tersebut.", {
          id: toastId,
        });
        return;
      }

      // (logika exportToExcel tidak berubah)
      const dataToExport = data.map((item) => ({
        Tanggal: new Date(item.created_at).toLocaleString("id-ID", {
          dateStyle: "long",
          timeStyle: "short",
        }),
        "No Pesanan": item.order_number,
        Pelanggan: item.customer_name,
        Item: item.items,
        "Total (Rp)": item.total_amount,
        "Status Pesanan": item.order_status,
        "Status Bayar": item.payment_status,
        "Metode Bayar": item.payment_method,
        Kasir: item.cashier_name,
      }));

      exportToExcel(dataToExport, "Laporan_Riwayat_Pesanan");
      toast.success("Ekspor berhasil!", { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  // (JSX return)
  if (loading) return <div className="p-4">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  <div className="p-4 md:p-6 animate-fade-in space-y-6">
    {/* Header Halaman (tidak berubah) */}
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-800">Order List</h1>
      <button
        onClick={() => navigate("/kasir/pesanan/tambah")}
        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg 
          font-semibold shadow-lg hover:bg-blue-700 transition-colors"
      >
        <BsPlusCircleFill />
        Tambah Pesanan
      </button>
    </div>

    {/* Ringkasan Status (tidak berubah) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatusCard
        title="New Orders"
        count={summaryData.newOrders}
        percentageChange={0}
      />
      <StatusCard
        title="Awaiting Desainer"
        count={summaryData.awaitingDesigner}
        percentageChange={0}
      />
      <StatusCard
        title="Process Production"
        count={summaryData.processProduction}
        percentageChange={0}
      />
      <StatusCard
        title="Take Orders"
        count={summaryData.takeOrders}
        percentageChange={0}
      />
    </div>

    {/* Bilah Pencarian dan Filter (tidak berubah) */}
    <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-600">s.d.</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleExport}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
            >
              <BsDownload /> Export
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Tabel Daftar Pesanan (tidak berubah) */}
    <OrderTable
      orders={filteredOrders}
      onPayClick={handleOpenPayModal}
      onCancelClick={handleCancelOrder}
      userRole={currentUser?.role_name}
    />

    {/* Modal Pembayaran (tidak berubah) */}
    <PaymentModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onConfirm={handleProcessPayment}
      order={selectedOrder}
    />
  </div>;
};

export default OrderListPage;
