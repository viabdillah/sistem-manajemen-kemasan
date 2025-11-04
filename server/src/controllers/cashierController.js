// server/src/controllers/cashierController.js
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction'); // Diperlukan untuk 'createNewOrder'

/**
 * [POST] Mendaftarkan pelanggan baru
 * Versi Mongoose
 */
const createCustomer = async (req, res) => {
  const { name, email, whatsapp_number, production_address } = req.body;
  const cashierUserId = req.user.id; // 'id' (MongoDB _id) dari middleware

  if (!name || !whatsapp_number) {
    return res.status(400).json({ message: 'Nama dan No. WhatsApp wajib diisi' });
  }

  try {
    const newCustomer = await Customer.create({
      name,
      email,
      whatsapp_number,
      production_address,
      registered_by_user_id: cashierUserId
    });

    res.status(201).json({ 
      message: 'Pelanggan berhasil didaftarkan',
      customerId: newCustomer._id 
    });
  } catch (error) {
    // Tangani error email duplikat
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(409).json({ message: 'Email pelanggan sudah terdaftar' });
    }
    console.error('Error creating customer (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mendaftarkan pelanggan' });
  }
};

/**
 * [GET] Mengambil daftar semua pelanggan
 * Versi Mongoose
 */
const getCustomersList = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select('id name whatsapp_number') // Hanya ambil kolom yang dibutuhkan
      .sort({ name: 1 }); // Urutkan A-Z

    // Ubah data untuk frontend (ganti _id menjadi id)
    const formattedCustomers = customers.map(cust => ({
      id: cust._id,
      name: cust.name,
      whatsapp_number: cust.whatsapp_number
    }));
      
    res.status(200).json(formattedCustomers);
  } catch (error) {
    console.error('Error fetching customers (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
  }
};

/**
 * [POST] Membuat pesanan baru (Order)
 * Versi Mongoose (Denormalisasi)
 */
const createNewOrder = async (req, res) => {
  const { customer_id, items, total_amount, payment_method, payment_status } = req.body;
  const cashier_user_id = req.user.id;

  if (!customer_id || !items || items.length === 0 || !total_amount) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
  }

  // Tentukan status order berdasarkan 'has_design'
  const needsDesign = items.some(item => item.has_design === false);
  const order_status = needsDesign ? 'design_queue' : 'production_queue';
  const order_number = `ORD-${Date.now()}`;

  // Kita gunakan Sesi (Session) untuk Transaksi
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Buat Pesanan Baru
    // 'items' sudah ada di req.body, jadi kita masukkan langsung
    const newOrder = await Order.create([{
      order_number,
      customer_id,
      cashier_user_id,
      order_status,
      total_amount,
      payment_method,
      payment_status,
      items: items // Menyimpan sub-dokumen (denormalisasi)
    }], { session });

    // 2. Buat Transaksi Keuangan (jika sudah lunas)
    if (payment_status === 'paid') {
      await Transaction.create([{
        type: 'pemasukan',
        description: `Pemasukan dari pesanan ${order_number}`,
        amount: total_amount,
        order_id: newOrder[0]._id,
        recorded_by_user_id: cashier_user_id
      }], { session });
    }

    // 3. Commit transaksi
    await session.commitTransaction();
    
    res.status(201).json({ 
      message: `Pesanan berhasil diproses (${order_status})`, 
      orderId: newOrder[0]._id,
      orderNumber: order_number
    });

  } catch (error) {
    // 4. Rollback jika ada error
    await session.abortTransaction();
    console.error('Error creating new order (Mongoose):', error);
    res.status(500).json({ message: 'Gagal membuat pesanan' });
  } finally {
    session.endSession();
  }
};


/**
 * [GET] Mengambil riwayat semua pesanan
 * Versi Mongoose
 */
const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer_id', 'name') // Ambil nama dari koleksi Customer
      .sort({ created_at: -1 });

    // Format data untuk frontend
    const formattedOrders = orders.map(order => ({
      order_id: order._id,
      order_number: order.order_number,
      customer_name: order.customer_id ? order.customer_id.name : 'Pelanggan Dihapus',
      total_amount: order.total_amount,
      order_date: order.created_at,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      // Ambil 'kategori' dari item pertama
      category: order.items.length > 0 ? order.items[0].product_name : '-'
    }));
    
    res.status(200).json(formattedOrders);
    
  } catch (error) {
    console.error('Error fetching order history (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil riwayat pesanan' });
  }
};


/**
 * [PUT] Memproses Pembayaran Pesanan
 * Versi Mongoose
 */
const processPayment = async (req, res) => {
  const { orderId } = req.params;
  const recorded_by_user_id = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Ambil data pesanan
    const order = await Order.findById(orderId).session(session);

    if (!order) throw new Error('Pesanan tidak ditemukan');
    if (order.payment_status === 'paid') throw new Error('Pesanan ini sudah lunas');

    // 2. Ubah status pembayaran
    order.payment_status = 'paid';
    await order.save({ session });

    // 3. Catat di tabel 'transactions' (Pemasukan)
    await Transaction.create([{
      type: 'pemasukan',
      description: `Pemasukan dari pesanan ${order.order_number}`,
      amount: order.total_amount,
      order_id: order._id,
      recorded_by_user_id: recorded_by_user_id
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Pembayaran berhasil dicatat!' });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message || 'Gagal memproses pembayaran' });
  } finally {
    session.endSession();
  }
};


/**
 * [GET] Mengambil semua detail pesanan untuk Invoice
 * Versi Mongoose
 */
const getOrderDetailsForInvoice = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId)
      .populate('customer_id') // Ambil semua data pelanggan
      .populate('cashier_user_id', 'full_name'); // Ambil nama kasir

    if (!order) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
    }

    // Ubah data untuk frontend
    const invoiceData = {
      ...order.toObject(),
      // Ganti ID dengan objek data
      customer_name: order.customer_id.name,
      customer_email: order.customer_id.email,
      customer_phone: order.customer_id.whatsapp_number,
      cashier_name: order.cashier_user_id.full_name,
    };

    res.status(200).json(invoiceData);
  } catch (error) {
    console.error('Error fetching invoice data (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data invoice' });
  }
};


/**
 * [GET] Mengambil statistik utama untuk Dashboard Kasir
 * Versi Mongoose
 */
const getCashierDashboardStats = async (req, res) => {
  const cashierUserId = req.user.id; 

  try {
    // 1. Tentukan tanggal hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Awal hari
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Awal hari besok

    // 2. Ambil Statistik Angka
    const total_customers_registered = await Customer.countDocuments({ 
      registered_by_user_id: cashierUserId 
    });
    
    const total_orders_today = await Order.countDocuments({
      cashier_user_id: cashierUserId,
      created_at: { $gte: today, $lt: tomorrow }
    });

    // 3. Ambil 5 Pelanggan Terbaru
    const recentCustomersRaw = await Customer.find({ 
      registered_by_user_id: cashierUserId 
    })
    .sort({ created_at: -1 })
    .limit(5);

    const recentCustomers = recentCustomersRaw.map(c => ({
      id: c._id,
      name: c.name,
      whatsapp_number: c.whatsapp_number,
      created_at: c.created_at
    }));

    res.status(200).json({
      stats: {
        total_customers_registered,
        total_orders_today
      },
      recentCustomers
    });

  } catch (error) {
    console.error('Error fetching cashier stats (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil statistik kasir' });
  }
};

// --- PERBARUI module.exports ---
module.exports = {
  createCustomer,
  getCustomersList,
  createNewOrder,
  getOrderHistory,
  processPayment,
  getOrderDetailsForInvoice,
  getCashierDashboardStats, // <-- Tambahkan ini
};