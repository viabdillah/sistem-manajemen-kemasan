// client/src/contexts/LayoutContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  return useContext(LayoutContext);
};

export const LayoutProvider = ({ children }) => {
  // State untuk melacak apakah sidebar mobile terbuka atau tidak
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};