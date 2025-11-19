// Utilitas Analisis Bisnis Cerdas

export const analyzeFinance = (logs) => {
    const income = logs.filter(l => l.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const expense = logs.filter(l => l.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const profit = income - expense;
    const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : 0;
  
    let insight = "";
    let status = "neutral";
  
    if (profit > 0 && margin > 20) {
      insight = `🚀 **Kinerja Sangat Baik:** Profit margin Anda mencapai ${margin}%, ini di atas rata-rata industri. Pertahankan efisiensi operasional.`;
      status = "good";
    } else if (profit > 0) {
      insight = `⚠️ **Perlu Perhatian:** Bisnis profit, tapi margin tipis (${margin}%). Coba kurangi pengeluaran operasional atau naikkan volume penjualan.`;
      status = "warning";
    } else {
      insight = `🚨 **Bahaya:** Arus kas negatif. Pengeluaran melebihi pemasukan. Segera audit pos pengeluaran terbesar.`;
      status = "danger";
    }
  
    return { income, expense, profit, margin, insight, status };
  };
  
  export const analyzeStock = (inventory) => {
    const lowStockItems = inventory.filter(i => i.stock <= i.min_stock);
    const totalItems = inventory.length;
    const healthyStock = totalItems - lowStockItems.length;
    const healthScore = totalItems > 0 ? Math.round((healthyStock / totalItems) * 100) : 0;
  
    let insight = "";
    let status = "neutral";
  
    if (lowStockItems.length === 0) {
      insight = `✅ **Gudang Sehat:** Stok aman terkendali. Tidak ada barang yang kritis. Siap untuk produksi skala besar.`;
      status = "good";
    } else if (lowStockItems.length < 3) {
      insight = `⚠️ **Restock Segera:** Ada ${lowStockItems.length} item menipis (${lowStockItems.map(i => i.name).join(', ')}). Lakukan pembelian sebelum produksi terhambat.`;
      status = "warning";
    } else {
      insight = `🚨 **Kritis:** Banyak stok habis! ${lowStockItems.length} item perlu restock segera. Risiko produksi berhenti sangat tinggi.`;
      status = "danger";
    }
  
    return { lowStockCount: lowStockItems.length, healthScore, insight, status, lowStockItems };
  };