// client/src/components/admin/EditUserModal.jsx
import React, { useState, useEffect } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
// --- HAPUS: import toast from 'react-hot-toast'; ---

// --- HAPUS: const API_URL = ... (Tidak ada 'fetch' di file ini) ---

const EditUserModal = ({ isOpen, onClose, onSave, user, roles }) => {
  const [fullName, setFullName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // --- HAPUS: state 'isSendingReset' ---

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setSelectedRoleId(user.role_id || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // --- PERBAIKAN: Gunakan 'user._id' agar konsisten dengan Mongoose ---
    // Fungsi 'onSave' (yaitu handleSaveEdit di parent) akan menangani 'fetch'
    await onSave(user._id, fullName, selectedRoleId);

    setIsSaving(false);
  };

  // --- HAPUS: Fungsi 'handlePasswordReset' (sudah dipindah ke ManageUsersPage.jsx) ---

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
            Edit Pengguna
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="" disabled>
                  -- Pilih Role --
                </option>
                {/* Controller Anda memformat _id menjadi id, jadi 'role.id' sudah benar */}
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="capitalize">
                    {role.name.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>

          {/* --- HAPUS: Seluruh bagian 'Manajemen Akun' --- */}
        </div>
      </div>
    </>
  );
};

export default EditUserModal;
