// server/src/controllers/managerController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Material = require('../models/Material');
const MaterialHistory = require('../models/MaterialHistory');
const mongoose = require('mongoose'); // Pastikan mongoose diimpor

/**
 * [GET] Mengambil statistik utama untuk Dashboard Manajer
 * Versi Mongoose
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Ambil data keuangan
    const finance = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let total_pemasukan = 0;
    let total_pengeluaran = 0;
    finance.forEach(item => {
      if (item._id === 'pemasukan') total_pemasukan = item.total;
      if (item._id === 'pengeluaran') total_pengeluaran = item.total;
    });

    // 2. Ambil data pesanan
    const pesanan_aktif = await Order.countDocuments({
      order_status: { $in: ['design_queue', 'design_review', 'production_queue', 'in_production'] }
    });
    const pesanan_selesai = await Order.countDocuments({ order_status: 'completed' });

    // 3. Ambil data pengeluaran bahan (Estimasi)
    const materialCost = await MaterialHistory.aggregate([
      { $match: { type: 'pengeluaran' } },
      {
        $lookup: {
          from: 'materials',
          localField: 'material_id',
          foreignField: '_id',
          as: 'material_info'
        }
      },
      { $unwind: '$material_info' },
      {
        $group: {
          _id: null,
          total_biaya_bahan: { $sum: { $multiply: ["$quantity", "$material_info.base_price_estimasi"] } }
        }
      }
    ]);

    res.status(200).json({
      total_pemasukan: total_pemasukan,
      total_pengeluaran: total_pengeluaran,
      total_biaya_bahan: materialCost.length > 0 ? materialCost[0].total_biaya_bahan : 0,
      pesanan_aktif: pesanan_aktif,
      pesanan_selesai: pesanan_selesai,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil statistik dashboard' });
  }
};

/**
 * [GET] Mengambil Laporan Produksi (Semua pesanan aktif)
 * Versi Mongoose
 */
const getProductionReport = async (req, res) => {
  try {
    const orders = await Order.find({
      order_status: { $in: ['design_queue', 'design_review', 'production_queue', 'in_production'] }
    })
    .populate('customer_id', 'name')
    .sort({ created_at: 'asc' });

    const formattedOrders = orders.map(order => ({
      id: order._id,
      order_number: order.order_number,
      order_status: order.order_status,
      created_at: order.created_at,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil laporan produksi' });
  }
};

/**
 * [GET] Mengambil data EKSPOR Laporan Keuangan
 * Versi Mongoose (dengan filter tanggal)
 */
const exportFinancials = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Rentang waktu diperlukan' });
  }

  try {
    const transactions = await Transaction.find({
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    })
    .populate('recorded_by_user_id', 'full_name')
    .populate('order_id', 'order_number')
    .sort({ created_at: -1 });

    const formatted = transactions.map(t => ({...t.toObject()}));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ekspor keuangan' });
  }
};

/**
 * [GET] Mengambil data EKSPOR Riwayat Inventaris
 * Versi Mongoose (dengan filter tanggal)
 */
const exportInventoryHistory = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Rentang waktu diperlukan' });
  }
  
  try {
    const history = await MaterialHistory.find({
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    })
    .populate('material_id')
    .populate('recorded_by_user_id', 'full_name')
    .populate('order_id', 'order_number')
    .sort({ created_at: -1 });

    const formatted = history.map(h => ({...h.toObject()}));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ekspor inventaris' });
  }
};

/**
 * [GET] Mengambil data EKSPOR Riwayat Pesanan (Order List)
 * Versi Mongoose (dengan filter tanggal)
 */
const exportOrderHistory = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Rentang waktu diperlukan' });
  }

  try {
    const orders = await Order.find({
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    })
    .populate('customer_id', 'name')
    .populate('cashier_user_id', 'full_name')
    .sort({ created_at: -1 });

    const formatted = orders.map(o => ({
      ...o.toObject(),
      items: o.items.map(item => item.product_name).join(', ')
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ekspor pesanan' });
  }
};

// --- FUNGSI YANG HILANG (PENYEBAB ERROR) ---

/**
 * [GET] Mengambil data untuk chart penjualan
 * Versi Mongoose (Duplikat dari financialController untuk keamanan rute)
 */
const getSalesChartData = async (req, res) => {
  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 6));
    sevenDaysAgo.setHours(0, 0, 0, 0);
    startDate = sevenDaysAgo;
    endDate = today;
  } else {
    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);
  }

  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          created_at: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          total_pemasukan: { $sum: { $cond: [{ $eq: ["$type", "pemasukan"] }, "$amount", 0] } },
          total_pengeluaran: { $sum: { $cond: [{ $eq: ["$type", "pengeluaran"] }, "$amount", 0] } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, tanggal: "$_id", total_pemasukan: 1, total_pengeluaran: 1 } }
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data chart' });
  }
};

/**
 * [GET] Mengambil data untuk chart penggunaan bahan
 * Versi Mongoose
 */
const getMaterialUsageChartData = async (req, res) => {
  try {
    const data = await MaterialHistory.aggregate([
      { $match: { type: 'pengeluaran' } },
      { 
        $group: { 
          _id: "$material_id", 
          total_used: { $sum: "$quantity" } 
        } 
      },
      { $sort: { total_used: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: '_id',
          as: 'material_info'
        }
      },
      { $unwind: '$material_info' },
      { $project: { _id: 0, name: "$material_info.name", total_used: 1 } }
    ]);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching material chart (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data chart bahan' });
  }
};

// --- EKSPOR LENGKAP ---
module.exports = {
  getDashboardStats,
  getProductionReport,
  exportFinancials,
  exportInventoryHistory,
  exportOrderHistory,
  getSalesChartData,
  getMaterialUsageChartData,
};