// client/src/components/admin/EditUserModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../../firebaseConfig'; // Kita perlu ini untuk token

// 1. Definisikan API_URL menggunakan environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditUserModal = ({ isOpen, onClose, onSave, user, roles }) => {
  const [fullName, setFullName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setSelectedRoleId(user.role_id || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Panggilan 'onSave' ini sudah benar,
    // karena 'fetch' yang sebenarnya ada di 'ManageUsersPage.jsx'
    await onSave(user.id, fullName, selectedRoleId);
    setIsSaving(false);
  };

  // 2. Perbarui 'handlePasswordReset'
  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    const toastId = toast.loading('Mengirim email reset password...');
    try {
      const token = await auth.currentUser.getIdToken();
      
      // Perbarui panggilan fetch di sini
      const response = await fetch(`${API_URL}/api/admin/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengirim');

      toast.success(data.message, { id: toastId });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSendingReset(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Pengguna</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="" disabled>-- Pilih Role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="capitalize">
                    {role.name.replace('_', ' ')}
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
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>

          <div className="border-t mt-6 pt-6">
            <h3 className="text-lg font-medium text-gray-800">Manajemen Akun</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">
              Kirim email ke <strong>{user?.email}</strong> untuk mengatur ulang password mereka.
            </p>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSendingReset}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg 
                         hover:bg-gray-700 disabled:bg-gray-400 text-sm font-medium"
            >
              {isSendingReset ? 'Mengirim...' : 'Kirim Email Reset Password'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserModal;