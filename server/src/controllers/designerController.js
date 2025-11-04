// server/src/controllers/designerController.js
const Order = require('../models/Order');

/**
 * [GET] Mengambil Antrian Desain (pekerjaan baru)
 * Status: 'design_queue'
 * Versi Mongoose
 */
const getDesignQueue = async (req, res) => {
  try {
    // 1. Ambil pesanan yang statusnya 'design_queue'
    // Kita 'populate' customer_id untuk mendapatkan nama pelanggan
    const orders = await Order.find({ order_status: 'design_queue' })
      .populate('customer_id', 'name') // Ambil 'name' dari koleksi 'Customer'
      .sort({ created_at: 'asc' }); // Urutkan terlama dulu

    // 2. Format data untuk frontend
    // Kita tidak perlu mengambil 'items' secara terpisah, karena sudah ada di dalam 'Order'
    const result = orders.map(order => ({
      id: order._id,
      order_number: order.order_number,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
      created_at: order.created_at,
      items: order.items // 'items' sudah ada di dokumen pesanan
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching design queue (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil antrian desain' });
  }
};

/**
 * [GET] Mengambil Riwayat Desain (pekerjaan selesai)
 * Versi Mongoose
 */
const getDesignHistory = async (req, res) => {
  try {
    const orders = await Order.find({ 
      order_status: { $in: ['design_review', 'production_queue', 'completed', 'cancelled'] }
    })
    .populate('customer_id', 'name')
    .sort({ created_at: 'desc' });

    // Format data
    const formattedHistory = orders.map(order => ({
      id: order._id,
      order_number: order.order_number,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
      created_at: order.created_at,
      order_status: order.order_status
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching design history (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil riwayat desain' });
  }
};

/**
 * [PUT] Menyelesaikan/Mengkonfirmasi desain dan mengirim ke Produksi
 * Mengubah status: 'design_queue' -> 'production_queue'
 * Versi Mongoose
 */
const sendToProduction = async (req, res) => {
  const { orderId } = req.params;
  
  try {
    // Cari pesanan dan update statusnya
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, order_status: 'design_queue' }, // Kondisi pencarian
      { order_status: 'production_queue' }, // Data update
      { new: true } // Opsi untuk mengembalikan dokumen baru
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan atau status salah' });
    }
    
    res.status(200).json({ message: 'Desain berhasil dikonfirmasi dan dikirim ke Produksi' });
  } catch (error) {
    console.error('Error sending to production (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengirim ke produksi' });
  }
};

module.exports = {
  getDesignQueue,
  getDesignHistory,
  sendToProduction,
};