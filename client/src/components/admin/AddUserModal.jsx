// client/src/components/admin/AddUserModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const AddUserModal = ({ isOpen, onClose, onSave, roles }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: "", // <-- Mulai sebagai string kosong
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (formData.password.length < 6) {
      toast.error("Password baru harus minimal 6 karakter.");
      return;
    }
    if (!formData.role_id) {
      // <-- Pengecekan ini sekarang berfungsi
      toast.error("Silakan pilih role untuk pengguna baru.");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast.success("Pengguna baru berhasil ditambahkan!");
      setFormData({ full_name: "", email: "", password: "", role_id: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Gagal menambahkan pengguna");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daftarkan Pengguna Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password (Min. 6 Karakter){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <BsEyeSlash size={18} />
                  ) : (
                    <BsEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* --- INI ADALAH PERBAIKAN PENTING --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="" disabled>
                  -- Pilih Role --
                </option>
                {roles.map((role) => (
                  // 'role.id' ini adalah '_id' dari Mongoose
                  <option key={role.id} value={role.id} className="capitalize">
                    {role.name.replace("_", " ")}
                  </option>
                ))}
              </select>
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
                {loading ? "Menyimpan..." : "Daftarkan Pengguna"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;