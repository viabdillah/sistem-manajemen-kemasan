// server/src/controllers/financialController.js
const Transaction = require('../models/Transaction');

/**
 * [GET] Mengambil semua riwayat transaksi
 * Versi Mongoose
 */
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('recorded_by_user_id', 'full_name')
      .populate('order_id', 'order_number')
      .sort({ created_at: -1 });

    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      type: t.type,
      description: t.description,
      amount: t.amount,
      order_id: t.order_id ? t.order_id._id : null,
      order_number: t.order_id ? t.order_id.order_number : null,
      created_at: t.created_at,
      recorded_by: t.recorded_by_user_id ? t.recorded_by_user_id.full_name : 'User Dihapus',
    }));
      
    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data keuangan' });
  }
};

/**
 * [POST] Membuat transaksi manual (Pemasukan / Pengeluaran)
 * Versi Mongoose
 */
const createManualTransaction = async (req, res) => {
  const { type, description, amount } = req.body;
  const recorded_by_user_id = req.user.id;

  if (!type || !description || !amount) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    await Transaction.create({
      type,
      description,
      amount,
      recorded_by_user_id
    });
    res.status(201).json({ message: 'Transaksi berhasil dicatat' });
  } catch (error) {
    console.error('Error creating manual transaction (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mencatat transaksi' });
  }
};

/**
 * [GET] Mengambil data untuk chart penjualan
 * Versi Mongoose
 */
const getSalesChartData = async (req, res) => {
  let { startDate, endDate } = req.query;

  // Tentukan rentang waktu default (7 hari)
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
    // Kueri Agregasi MongoDB
    const data = await Transaction.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          total_pemasukan: {
            $sum: { $cond: [{ $eq: ["$type", "pemasukan"] }, "$amount", 0] }
          },
          total_pengeluaran: {
            $sum: { $cond: [{ $eq: ["$type", "pengeluaran"] }, "$amount", 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, tanggal: "$_id", total_pemasukan: 1, total_pengeluaran: 1 } }
    ]);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching chart data (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data chart' });
  }
};

module.exports = {
  getAllTransactions,
  createManualTransaction,
  getSalesChartData,
};