// client/src/pages/admin/ManageUsersPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import EditUserModal from "../../components/admin/EditUserModal.jsx";
import ResetPasswordModal from "../../components/admin/ResetPasswordModal.jsx";
import AddUserModal from "../../components/admin/AddUserModal.jsx"; // <-- 1. Impor Modal Baru
import { BsPencil, BsTrash, BsKey, BsFillPersonPlusFill } from "react-icons/bs"; // <-- 2. Ganti Ikon

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);

  // --- 3. State Baru untuk Modal Tambah ---
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // (Fungsi getAuthToken, fetchData, modal edit, modal reset tidak berubah)
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Admin tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers }),
        fetch(`${API_URL}/api/admin/roles`, { headers }),
      ]);
      if (!usersRes.ok) throw new Error("Gagal mengambil data pengguna");
      if (!rolesRes.ok) throw new Error("Gagal mengambil data roles");
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleOpenResetModal = (user) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };
  const handleCloseResetModal = () => {
    setUserToReset(null);
    setIsResetModalOpen(false);
  };

  // --- 4. Handler Baru untuk Modal Tambah ---
  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };
  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  // (handleSaveEdit dan handleDeleteUser tetap sama)
  const handleSaveEdit = async (userId, newFullName, newRoleId) => {
    const toastId = toast.loading("Menyimpan perubahan...");
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ full_name: newFullName, role_id: newRoleId }),
        }
      );
      if (!response.ok) throw new Error("Gagal memperbarui pengguna");
      toast.success("Pengguna berhasil diperbarui!", { id: toastId });
      handleCloseEditModal();
      fetchData();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDeleteUser = (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p>
            Anda yakin ingin menonaktifkan <strong>{user.full_name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const toastId = toast.loading("Menonaktifkan pengguna...");
                try {
                  const token = getAuthToken();
                  const response = await fetch(
                    `${API_URL}/api/admin/users/${user._id}`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (!response.ok) throw new Error("Gagal");
                  toast.success("Pengguna dinonaktifkan", { id: toastId });
                  fetchData();
                } catch (err) {
                  toast.error(err.message, { id: toastId });
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
      ),
      { duration: 60000 }
    );
  };

  // (handleConfirmResetPassword tetap sama)
  const handleConfirmResetPassword = async (userId, newPassword) => {
    const toastId = toast.loading("Mereset password pengguna...");
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, newPassword }),
        }
      );
      if (!response.ok) throw new Error("Gagal mereset password");
      toast.success("Password berhasil direset!", { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err.message, { id: toastId });
      throw err; // Lempar error agar modal tahu
    }
  };

  // --- 5. Handler untuk Menyimpan User Baru ---
  const handleAddNewUser = async (formData) => {
    // Fungsi ini akan melempar error jika gagal, agar modal bisa menampilkannya
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/api/admin/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Gagal mendaftarkan pengguna");
    }

    fetchData(); // Refresh tabel setelah sukses
  };

  if (loading) return <div className="p-4">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* --- 6. HEADER DIPERBARUI (Tombol "Tambah Pengguna Baru") --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Pengguna</h1>
        <button
          onClick={handleOpenAddUserModal} // <-- Aksi baru
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white 
           rounded-lg font-semibold shadow-lg hover:bg-green-700 
           transition-all duration-300 transform hover:scale-105"
        >
          <BsFillPersonPlusFill /> {/* <-- Ikon baru */}
          Tambah Pengguna Baru {/* <-- Teks baru */}
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Lengkap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.role_name ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {user.role_name.replace("_", " ")}
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Belum di-assign
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.passwordResetRequested && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">
                      Minta Reset
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleOpenResetModal(user)}
                    className="text-orange-600 hover:text-orange-900 transition-colors"
                    title="Reset Password Pengguna"
                  >
                    <BsKey size={18} />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(user)}
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

      {/* --- 7. Tambahkan SEMUA Modal ke JSX --- */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        user={selectedUser}
        roles={roles}
      />
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={handleCloseResetModal}
        onConfirm={handleConfirmResetPassword}
        user={userToReset}
      />
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSave={handleAddNewUser}
        roles={roles}
      />
    </div>
  );
};

export default ManageUsersPage;
