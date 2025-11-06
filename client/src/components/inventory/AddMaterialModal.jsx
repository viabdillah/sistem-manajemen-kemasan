// client/src/components/inventory/AddMaterialModal.jsx
import React, { useState, useCallback } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddMaterialModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    size: "",
    quantity: 0,
    unit: "",
  });
  const [loading, setLoading] = useState(false);

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 3. Perbarui 'handleSubmit' ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Menyimpan bahan baru...");

    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/inventory/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan");

      toast.success(data.message, { id: toastId });
      onSaveSuccess();
      setFormData({ name: "", type: "", size: "", quantity: 0, unit: "" }); // Reset form
      onClose();
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- Sisa JSX di bawah ini sudah benar (tidak berubah) ---
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tambah Bahan Baku Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Bahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Bahan
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Misal: Kertas, Tinta"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ukuran
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Misal: A4, 100ml"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jumlah Awal
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  placeholder="Misal: Lembar, Roll, Botol"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Menyimpan..." : "Simpan Bahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMaterialModal;
