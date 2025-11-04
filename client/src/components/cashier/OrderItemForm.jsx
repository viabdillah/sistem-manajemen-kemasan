// client/src/components/cashier/OrderItemForm.jsx
import React from 'react';

// 'index' adalah urutan item (0, 1, 2, ...)
// 'itemData' adalah data untuk item ini
// 'onItemChange' adalah fungsi untuk update data di parent
// 'onRemoveItem' adalah fungsi untuk menghapus item ini
const OrderItemForm = ({ index, itemData, onItemChange, onRemoveItem }) => {
  
  // Fungsi 'handleChange' internal
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue;

    if (type === 'checkbox') {
      // LOGIKA PENTING:
      // Checkbox "Belum ada desain" (name="has_design")
      // Jika dicentang (checked=true) => belum ada desain => has_design: false
      // Jika tidak dicentang (checked=false) => sudah ada desain => has_design: true
      newValue = name === 'has_design' ? !checked : checked;
    } else {
      newValue = value;
    }
    
    // Panggil fungsi parent untuk update state
    onItemChange(index, { ...itemData, [name]: newValue });
  };

  return (
    // Kartu untuk satu item pesanan
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative animate-fade-in">
      
      {/* Tombol Hapus Item */}
      {index > 0 && ( // Jangan boleh hapus item pertama
        <button
          type="button"
          onClick={() => onRemoveItem(index)}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full 
                     shadow-md hover:bg-red-700 flex items-center justify-center font-bold"
          aria-label="Hapus item"
        >
          &times;
        </button>
      )}

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Item #{index + 1}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Produk <span className="text-red-500">*</span></label>
            <input type="text" name="product_name" value={itemData.product_name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Label</label>
            <input type="text" name="label_name" value={itemData.label_name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Kemasan</label>
            <input type="text" name="packaging_type" value={itemData.packaging_type} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          {/* Checkbox "Belum ada desain" */}
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              name="has_design"
              // Kita balik logikanya untuk UI
              // has_design: false => checkbox harus dicentang
              checked={!itemData.has_design}
              onChange={handleChange}
              id={`has_design_${index}`}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor={`has_design_${index}`} className="ml-2 block text-sm font-medium text-gray-800">
              Belum ada desain (Kirim ke Desainer)
            </label>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">No. PIRT</label>
            <input type="text" name="pirt_number" value={itemData.pirt_number} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No. Halal</label>
            <input type="text" name="halal_number" value={itemData.halal_number} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah <span className="text-red-500">*</span></label>
              <input type="number" name="quantity" value={itemData.quantity} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga /pcs <span className="text-red-500">*</span></label>
              <input type="number" name="price_per_pcs" value={itemData.price_per_pcs} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Keterangan Item</label>
            <textarea name="notes" value={itemData.notes} onChange={handleChange} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemForm;