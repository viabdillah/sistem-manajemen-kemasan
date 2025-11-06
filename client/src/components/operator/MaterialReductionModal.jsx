// client/src/components/operator/MaterialReductionModal.jsx
import React, { useState, useCallback, useEffect } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";
import { BsPlusLg, BsTrash } from "react-icons/bs";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const MaterialReductionModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  orderId,
  materialsList,
}) => {
  const [items, setItems] = useState([
    { material_id: "", quantity: 1, description: "" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems([{ material_id: "", quantity: 1, description: "" }]);
    }
  }, [isOpen]);

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { material_id: "", quantity: 1, description: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 3. Perbarui 'handleSubmit'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Memulai produksi dan mengurangi stok...");

    for (const item of items) {
      if (!item.material_id || !item.quantity) {
        toast.error("Pastikan semua bahan dan jumlah diisi", { id: toastId });
        setLoading(false);
        return;
      }
    }

    const payload = {
      materialsToReduce: items.map((item) => ({
        // --- PERBAIKAN BUG: Kirim _id sebagai string, bukan Number ---
        material_id: item.material_id,
        quantity: Number(item.quantity),
        description: item.description || "Pengurangan stok untuk produksi",
      })),
    };

    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(`${API_URL}/api/operator/start/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal memulai produksi");

      toast.success(data.message, { id: toastId });
      onSaveSuccess();
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Mulai Produksi (Pengurangan Stok)
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg relative"
                >
                  {/* Kolom 1: Bahan */}
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700">
                      Bahan Baku
                    </label>
                    <select
                      name="material_id"
                      value={item.material_id}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full mt-1 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="" disabled>
                        -- Pilih Bahan --
                      </option>
                      {materialsList.map((m) => (
                        // --- 4. PERBAIKAN BUG: Gunakan m._id dari Mongoose ---
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.size || "N/A"}) - Sisa: {m.quantity}{" "}
                          {m.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Kolom 2: Jumlah */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleChange(index, e)}
                      required
                      min="1"
                      className="w-full mt-1 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                      i
                    />
                  </div>
                  {/* Kolom 3: Keterangan */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="Opsional"
                      className="w-full mt-1 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {/* Tombol Hapus */}
                  <div className="col-span-1 flex items-end">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <BsTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm
             font-semibold shadow hover:bg-green-600"
              >
                <BsPlusLg />
                Tambah Bahan
              </button>
              <div className="flex gap-3">
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
                  {loading ? "Menyimpan..." : "Mulai Produksi"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MaterialReductionModal;
