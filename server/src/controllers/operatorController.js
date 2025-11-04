// server/src/controllers/operatorController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Material = require('../models/Material');
const MaterialHistory = require('../models/MaterialHistory');

/**
 * [GET] Mengambil Antrian Produksi
 * Status: 'production_queue'
 * Versi Mongoose
 */
const getProductionQueue = async (req, res) => {
  try {
    const orders = await Order.find({ order_status: 'production_queue' })
      .populate('customer_id', 'name')
      .sort({ created_at: 'asc' });
      
    const formattedOrders = orders.map(order => ({
      id: order._id,
      order_number: order.order_number,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
      created_at: order.created_at
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil antrian produksi' });
  }
};

/**
 * [GET] Mengambil pesanan yang Sedang Diproduksi
 * Status: 'in_production'
 * Versi Mongoose
 */
const getInProgressOrders = async (req, res) => {
  try {
    const orders = await Order.find({ order_status: 'in_production' })
      .populate('customer_id', 'name')
      .sort({ created_at: 'asc' });

    const formattedOrders = orders.map(order => ({
      id: order._id,
      order_number: order.order_number,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
      created_at: order.created_at
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data produksi' });
  }
};


/**
 * [PUT] Memulai Produksi (API KUNCI)
 * Mengubah status: 'production_queue' -> 'in_production'
 * Mengurangi stok
 * Versi Mongoose
 */
const startProduction = async (req, res) => {
  const { orderId } = req.params;
  const { materialsToReduce } = req.body;
  const recorded_by_user_id = req.user.id;

  if (!materialsToReduce || materialsToReduce.length === 0) {
    return res.status(400).json({ message: 'Data pengurangan bahan wajib diisi' });
  }

  // Kita gunakan Sesi (Session) untuk Transaksi
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Ubah status pesanan
    const order = await Order.findOne(
      { _id: orderId, order_status: 'production_queue' }
    ).session(session);

    if (!order) {
      throw new Error('Pesanan tidak ditemukan atau status salah');
    }

    order.order_status = 'in_production';
    await order.save({ session });

    // 2. Loop dan kurangi stok + catat riwayat
    for (const item of materialsToReduce) {
      // Kurangi stok di master
      const updatedMaterial = await Material.findByIdAndUpdate(
        item.material_id,
        { $inc: { quantity: -item.quantity } }, // $inc untuk mengurangi (atomic)
        { session }
      );

      // (Opsional: Cek jika stok jadi minus)
      if (updatedMaterial.quantity < item.quantity) {
        // (Anda bisa melempar error di sini jika tidak boleh stok minus)
        // throw new Error(`Stok ${updatedMaterial.name} tidak mencukupi.`);
      }

      // Catat di riwayat
      await MaterialHistory.create([{
        material_id: item.material_id,
        type: 'pengeluaran',
        quantity: item.quantity,
        description: item.description,
        order_id: orderId,
        recorded_by_user_id: recorded_by_user_id
      }], { session });
    }

    await session.commitTransaction();
    res.status(200).json({ message: 'Produksi dimulai dan stok berhasil dikurangi' });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message || 'Gagal memulai produksi' });
  } finally {
    session.endSession();
  }
};

/**
 * [PUT] Menyelesaikan Produksi
 * Mengubah status: 'in_production' -> 'completed'
 * Versi Mongoose
 */
const finishProduction = async (req, res) => {
  const { orderId } = req.params;
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, order_status: 'in_production' },
      { order_status: 'completed' },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan atau status salah' });
    }
    res.status(200).json({ message: 'Produksi Selesai! Pesanan siap diambil.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyelesaikan produksi' });
  }
};

module.exports = {
  getProductionQueue,
  getInProgressOrders,
  startProduction,
  finishProduction,
};