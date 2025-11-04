// client/src/pages/admin/ManageUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import EditUserModal from '../../components/admin/EditUserModal.jsx'; // Pastikan .jsx ada
import { BsPencil, BsTrash } from 'react-icons/bs';

// 1. Definisikan API_URL menggunakan environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Admin tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchData'
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // 2a. Perbarui fetch users
      const usersRes = await fetch(`${API_URL}/api/admin/users`, { headers });
      if (!usersRes.ok) throw new Error('Gagal mengambil data pengguna');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // 2b. Perbarui fetch roles
      const rolesRes = await fetch(`${API_URL}/api/admin/roles`, { headers });
      if (!rolesRes.ok) throw new Error('Gagal mengambil data roles');
      const rolesData = await rolesRes.json();
      setRoles(rolesData);

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]); // getAuthToken tidak bergantung pada API_URL

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // 3. Perbarui 'handleSaveEdit'
  const handleSaveEdit = async (userId, newFullName, newRoleId) => {
    const toastId = toast.loading('Menyimpan perubahan...');
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/edit`, { // Perbarui fetch
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          full_name: newFullName,
          role_id: newRoleId 
        }),
      });

      if (!response.ok) throw new Error('Gagal memperbarui pengguna');
      
      toast.success('Pengguna berhasil diperbarui!', { id: toastId });
      handleCloseModal();
      fetchData(); 
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  // 4. Perbarui 'handleDeleteUser'
  const handleDeleteUser = (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p>Anda yakin ingin menonaktifkan <strong>{user.full_name}</strong>?</p>
          <p className="text-sm text-gray-600">Pengguna ini tidak akan bisa login lagi.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const toastId = toast.loading('Menonaktifkan pengguna...');
                try {
                  const token = await getAuthToken();
                  const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, { // Perbarui fetch
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (!response.ok) throw new Error('Gagal');
                  
                  toast.success('Pengguna dinonaktifkan', { id: toastId });
                  fetchData();
                } catch (err) {
                  toast.error(err.message || 'Gagal', { id: toastId });
                }
              }}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold"
            >
              Ya, Nonaktifkan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      ), { duration: 60000 }
    );
  };

  if (loading) return <div className="p-4">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Kelola Pengguna</h1>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Saat Ini</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.role_name ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {user.role_name.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Belum di-assign
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Edit Pengguna"
                  >
                    <BsPencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Nonaktifkan Pengguna"
                  >
                    <BsTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
        user={selectedUser}
        roles={roles}
      />
    </div>
  );
};

export default ManageUsersPage;