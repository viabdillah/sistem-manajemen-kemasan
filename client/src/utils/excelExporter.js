// client/src/utils/excelExporter.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Fungsi helper untuk mengekspor data (Array of Objects) ke file Excel.
 * @param {Array<object>} data Data yang akan diekspor.
 * @param {string} fileName Nama file (tanpa .xlsx).
 */
export const exportToExcel = (data, fileName) => {
  if (!data || data.length === 0) {
    console.error("Tidak ada data untuk diekspor");
    return;
  }

  // 1. Buat 'Worksheet' dari data JSON
  const ws = XLSX.utils.json_to_sheet(data);
  
  // 2. Buat 'Workbook' baru
  const wb = XLSX.utils.book_new();
  
  // 3. Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, "Laporan"); // Nama sheet: "Laporan"

  // 4. Buat file Excel (binary buffer)
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // 5. Buat file 'Blob'
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
  });

  // 6. Picu unduhan menggunakan file-saver
  saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};