// client/src/components/admin/ResetPasswordModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsKey, BsEye, BsEyeSlash } from "react-icons/bs";

const ResetPasswordModal = ({ isOpen, onClose, onConfirm, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (newPassword.length < 6) {
      toast.error("Password baru harus minimal 6 karakter.");
      return;
    }

    setLoading(true);
    // Panggil fungsi onConfirm (yaitu handleConfirmResetPassword) dari parent
    // Kita teruskan ID pengguna dan password baru
    await onConfirm(user._id, newPassword);
    setLoading(false);
    setNewPassword(""); // Kosongkan form setelah sukses
    onClose(); // Tutup modal
  };

  if (!isOpen || !user) return null;

  return (
    <>
      {/* Latar belakang (backdrop) */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Konten Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header dengan Ikon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-full">
              <BsKey className="text-orange-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Anda akan mengatur password baru untuk{" "}
            <strong>{user.full_name}</strong> ({user.email}).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru (Min. 6 Karakter)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordModal;
