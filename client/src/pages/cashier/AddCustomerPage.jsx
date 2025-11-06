// client/src/pages/cashier/AddCustomerPage.jsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";
import { BsPeopleFill, BsSearch } from "react-icons/bs";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddCustomerPage = () => {
  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp_number: "",
    production_address: "",
  });
  const [loading, setLoading] = useState(false);

  // State untuk daftar pelanggan
  const [customers, setCustomers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  // 3. Perbarui 'fetchCustomers'
  const fetchCustomers = useCallback(async () => {
    setLoadingList(true);
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/kasir/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data pelanggan");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingList(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // 4. Perbarui 'handleSubmit'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mendaftarkan pelanggan...");

    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/kasir/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mendaftarkan pelanggan");
      }

      toast.success("Pelanggan berhasil didaftarkan!", { id: toastId });
      setFormData({
        name: "",
        email: "",
        whatsapp_number: "",
        production_address: "",
      });
      fetchCustomers();
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Logika untuk mem-filter pelanggan (tidak berubah)
  const filteredCustomers = useMemo(() => {
    if (!customers) return []; // Penjaga
    return customers.filter(
      (customer) =>
        (customer.name &&
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.whatsapp_number &&
          customer.whatsapp_number.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Tambah Pelanggan Baru
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Formulir (tidak berubah) */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="pelanggan@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="whatsapp_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No. WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="08xxxxxxxx"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="production_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Alamat Produksi (Opsional)
                </label>
                <textarea
                  name="production_address"
                  id="production_address"
                  value={formData.production_address}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Masukkan alamat lengkap untuk pengiriman atau detail produksi..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md
              hover:bg-blue-700 transition-colors duration-300
             disabled:bg-gray-400"
                >
                  {loading ? "Menyimpan..." : "Daftarkan Pelanggan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Pelanggan */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Daftar Pelanggan
            </h2>

            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <BsSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Cari nama atau no. WA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {loadingList ? (
                <p className="text-gray-500">Memuat daftar...</p>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-gray-500">
                  {searchTerm
                    ? "Pelanggan tidak ditemukan."
                    : "Belum ada pelanggan terdaftar."}
                </p>
              ) : (
                filteredCustomers.map((customer) => (
                  // --- 5. GANTI 'customer.id' ke 'customer._id' ---
                  <div
                    key={customer._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <BsPeopleFill size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {customer.whatsapp_number}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerPage;
