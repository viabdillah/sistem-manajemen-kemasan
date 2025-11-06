// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { BsEye, BsEyeSlash, BsEnvelope, BsLock } from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();

  // Efek untuk redirect (tidak berubah)
  useEffect(() => {
    if (currentUser) {
      // ... (Logika redirect Anda)
      const role = currentUser.role_name;
      switch (role) {
        case "admin_sistem":
          navigate("/admin/dashboard");
          break;
        case "kasir":
          navigate("/kasir");
          break;
        case "operator":
          navigate("/operator/antrian");
          break;
        case "desainer":
          navigate("/desainer/antrian");
          break;
        case "manajer":
          navigate("/manajer/dashboard");
          break;
        default:
          navigate("/unauthorized");
      }
    }
  }, [currentUser, navigate]);

  // Fungsi login (tidak berubah)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Login...");
    try {
      await login(email, password);
      toast.success("Login berhasil!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Email atau password salah.", { id: toastId });
      setLoading(false);
    }
  };

  // Fungsi Lupa Kata Sandi (tidak berubah)
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(
        "Mohon masukkan email Anda di kolom email untuk meminta reset."
      );
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Mengirim permintaan reset...");
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal");
      toast.success("Permintaan reset terkirim. Hubungi Admin.", {
        id: toastId,
        duration: 5000,
      });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- 1. PERUBAHAN BACKGROUND ---
    // Mengganti kontainer utama menjadi background statis (normal)
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      {/* --- HAPUS: Background Gradien Animasi & Blob --- */}

      {/* Form Login dengan animasi 'fade-in-up' (tetap ada) */}
      <div
        className="login-form-animation relative z-10 bg-white 
           p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-600">Sistem Manajemen Kemasan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <BsEnvelope size={18} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              // --- 2. TAMBAHAN ANIMASI HOVER & FOKUS ---
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:outline-none 
             transition-all duration-300 ease-in-out transform 
             hover:scale-[1.02] hover:border-blue-400
             focus:scale-[1.02]"
            />
          </div>

          {/* Input Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <BsLock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              // --- 2. TAMBAHAN ANIMASI HOVER & FOKUS ---
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:outline-none 
             transition-all duration-300 ease-in-out transform 
             hover:scale-[1.02] hover:border-blue-400
             focus:scale-[1.02]"
            />
            {/* Tombol Lihat Password (tidak berubah) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              title={showPassword ? "Sembunyikan" : "Tampilkan"}
            >
              {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
            </button>
          </div>

          {/* Lupa Password (tidak berubah) */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            // --- 2. TAMBAHAN ANIMASI HOVER & CLICK ---
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg 
           hover:bg-blue-700 shadow-lg transition-all duration-300 transform 
           hover:scale-105 active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
