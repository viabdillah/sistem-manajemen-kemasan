// client/src/components/inventory/AddStockModal.jsx
import React, { useState, useCallback } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddStockModal = ({ isOpen, onClose, onSaveSuccess, materials }) => {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  // --- 3. Perbarui 'handleSubmit' ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) {
      toast.error("Silakan pilih bahan terlebih dahulu");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Menambah stok...");

    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/inventory/stock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // --- PERBAIKAN BUG: Kirim _id sebagai string, bukan Number ---
          material_id: materialId,
          quantity: Number(quantity),
          description: description || "Pemasukan stok manual",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menambah stok");

      toast.success(data.message, { id: toastId });
      onSaveSuccess();
      setMaterialId("");
      setQuantity(1);
      setDescription("");
      onClose();
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tambah Stok (Pemasukan)
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pilih Bahan <span className="text-red-500">*</span>
              </label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="" disabled>
                  -- Pilih Bahan --
                </option>
                {materials.map((m) => (
                  // --- 4. PERBAIKAN BUG: Gunakan m._id dari Mongoose ---
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.type || "N/A"} - {m.size || "N/A"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Pemasukan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Misal: Pembelian dari Supplier X"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? "Menyimpan..." : "Tambah Stok"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStockModal;
