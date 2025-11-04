// client/src/components/layout/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';

const MainLayout = () => {
  const { isSidebarOpen, toggleSidebar } = useLayout();

  return (
    // UBAH: dari 'min-h-screen' menjadi 'h-screen' dan 'overflow-hidden'
    // Ini mengunci seluruh viewport
    <div className="h-screen w-full flex bg-gray-100 overflow-hidden">
      
      {/* === Sidebar (Desktop) === */}
      {/* Sidebar (dari Sidebar.jsx) sudah 'h-full' */}
      <div className="hidden lg:flex shadow-lg z-20 h-full relative">
        <Sidebar />
      </div>

      {/* === Sidebar (Mobile) === */}
      {/* (Ini sudah 'fixed' dan z-50, tidak ada perubahan) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        }
      >
        <Sidebar /> 
      </div>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar} 
        ></div>
      )}
      
      {/* === Area Konten (Navbar + Halaman) === */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Navbar (Header) */}
        {/* Navbar.jsx sudah 'sticky top-0 z-10', ini akan membuatnya tetap */}
        <Navbar />
        
        {/* Konten Halaman (Bisa di-scroll) */}
        {/* 'overflow-y-auto' di sini adalah kuncinya */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;