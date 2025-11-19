const Transaction = require('../models/Transaction');
const PackagingType = require('../models/PackagingType'); // Untuk ambil harga master

// Helper: Generate Invoice Number (INV-YYYYMMDD-XXXX)
const generateInvoiceNumber = async () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const prefix = `INV-${yyyy}${mm}${dd}`;

  // Cari invoice terakhir hari ini
  const lastTrans = await Transaction.findOne({ invoiceNumber: { $regex: prefix } }).sort({ invoiceNumber: -1 });
  
  let sequence = '0001';
  if (lastTrans) {
    const lastSeq = parseInt(lastTrans.invoiceNumber.split('-')[2]);
    sequence = String(lastSeq + 1).padStart(4, '0');
  }

  return `${prefix}-${sequence}`;
};

// 1. Buat Transaksi Baru
exports.createTransaction = async (req, res) => {
  try {
    const { customerId, items, firstPayment } = req.body; 
    // firstPayment bentuknya: { amount: 100000, method: 'Cash', note: 'DP' }

    // 1. Hitung Total (Validasi Harga di Backend)
    let totalAmount = 0;
    const fixedItems = [];

    // Kita asumsikan frontend kirim items dengan harga, tapi validasi harga sebaiknya di sini
    // Untuk simplifikasi tutorial ini, kita percaya data harga dari frontend atau ambil dari PackagingType
    // Di sini kita pakai data dari frontend tapi hitung ulang subtotalnya
    for (let item of items) {
        const subtotal = item.pricePerUnit * item.qty;
        totalAmount += subtotal;
        fixedItems.push({ ...item, subtotal });
    }

    // 2. Hitung Pembayaran Awal
    const paymentAmount = firstPayment ? parseInt(firstPayment.amount) : 0;
    const remaining = totalAmount - paymentAmount;

    // 3. Tentukan Status
    let status = 'Pending';
    if (paymentAmount > 0 && remaining > 0) status = 'Down Payment';
    if (paymentAmount > 0 && remaining <= 0) status = 'Paid';

    // 4. Buat Array Pembayaran
    const payments = [];
    if (paymentAmount > 0) {
        payments.push({
            amount: paymentAmount,
            method: firstPayment.method,
            note: firstPayment.note || 'Pembayaran Awal',
            date: new Date()
        });
    }

    // 5. Simpan
    const invoiceNumber = await generateInvoiceNumber();
    const newTrans = await Transaction.create({
        invoiceNumber,
        customerId,
        items: fixedItems,
        totalAmount,
        totalPaid: paymentAmount,
        remainingBalance: remaining,
        payments,
        status
    });

    res.status(201).json({ message: 'Transaksi berhasil dibuat', transaction: newTrans });

  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat transaksi', error: error.message });
  }
};

// 2. Ambil Detail Transaksi
exports.getTransactionDetail = async (req, res) => {
    try {
        const trans = await Transaction.findById(req.params.id).populate('customerId');
        if(!trans) return res.status(404).json({message: 'Transaksi tidak ditemukan'});
        res.json(trans);
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // Status baru yang dikirim frontend
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json({ message: 'Status berhasil diperbarui', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update status', error: error.message });
  }
};

// 4. Ambil Semua Transaksi (Untuk Desainer melihat antrian)
exports.getAllTransactions = async (req, res) => {
    try {
        // Ambil semua transaksi, urutkan dari yang terbaru, populate data customer
        const transactions = await Transaction.find()
            .populate('customerId')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};