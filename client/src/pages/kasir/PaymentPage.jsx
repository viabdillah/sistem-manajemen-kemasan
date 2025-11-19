import { useState, useEffect } from 'react';
import { 
  Search, CreditCard, CheckCircle, Package, 
  Clock, ArrowRight, Wallet, AlertCircle, X 
} from 'lucide-react'; // Jangan lupa import X untuk tombol close
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

const PaymentPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [payAmount, setPayAmount] = useState(''); // Disimpan sebagai string terformat "100.000"
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // --- FETCH DATA ---
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, customers(*)')
        .neq('order_status', 'Completed') 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- HELPER: FORMAT RUPIAH (Input) ---
  const formatRupiah = (value) => {
    // Hapus karakter selain angka
    const numberString = value.replace(/[^,\d]/g, '').toString();
    // Tambahkan titik setiap 3 digit
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  // Handler saat mengetik nominal
  const handleAmountChange = (e) => {
      setPayAmount(formatRupiah(e.target.value));
  };

  // --- HANDLERS ---

  // 1. BAYAR PELUNASAN
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // PENTING: Hapus titik sebelum konversi ke Number agar database bisa baca
    const cleanAmount = parseInt(payAmount.replace(/\./g, '')) || 0;
    
    if (cleanAmount <= 0) return Swal.fire('Error', 'Nominal harus > 0', 'error');
    if (cleanAmount > selectedTrx.remaining_balance) return Swal.fire('Error', 'Nominal melebihi sisa tagihan', 'error');

    try {
        const newPaid = selectedTrx.total_paid + cleanAmount;
        const newRemaining = selectedTrx.remaining_balance - cleanAmount;
        const newStatus = newRemaining <= 0 ? 'Paid' : 'Down Payment';

        const currentPayments = selectedTrx.payments || [];
        const newPaymentLog = {
            date: new Date().toISOString(),
            amount: cleanAmount,
            method: paymentMethod,
            note: 'Pelunasan / Angsuran'
        };

        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                total_paid: newPaid,
                remaining_balance: newRemaining,
                status: newStatus,
                payments: [...currentPayments, newPaymentLog]
            })
            .eq('id', selectedTrx.id);
        
        if (updateError) throw updateError;

        // Catat ke Keuangan
        await supabase.from('finance_logs').insert([{
            type: 'income',
            category: 'Pelunasan',
            amount: cleanAmount,
            description: `Pelunasan Invoice ${selectedTrx.invoice_number}`,
            payment_method: paymentMethod,
            transaction_id: selectedTrx.id
        }]);

        Swal.fire('Berhasil', 'Pembayaran diterima.', 'success');
        setPayAmount('');
        setSelectedTrx(null); 
        fetchTransactions(); 

    } catch (error) {
        Swal.fire('Gagal', error.message, 'error');
    }
  };

  // 2. SERAH TERIMA BARANG
  const handleHandover = async (trx) => {
    if (trx.remaining_balance > 0) {
        return Swal.fire('Belum Lunas', 'Harap lunasi pembayaran terlebih dahulu.', 'warning');
    }
    if (trx.order_status !== 'Ready') {
        return Swal.fire('Belum Siap', 'Barang belum selesai diproduksi oleh operator.', 'warning');
    }

    Swal.fire({
        title: 'Serah Terima & Selesaikan?',
        text: "Barang akan diserahkan ke pelanggan dan pesanan ditutup (Completed).",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Ya, Selesaikan'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { error } = await supabase
                .from('transactions')
                .update({ order_status: 'Completed' })
                .eq('id', trx.id);
            
            if (!error) {
                Swal.fire('Selesai!', 'Transaksi ditutup.', 'success');
                fetchTransactions();
            }
        }
    });
  };

  // Filter Pencarian
  const filteredData = transactions.filter(t => 
    t.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-blue-600"/> Kasir & Pengambilan
            </h1>
            <p className="text-gray-500 text-sm">Kelola pelunasan dan serah terima barang.</p>
        </div>
        <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
                type="text" 
                placeholder="Cari Invoice / Nama..." 
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* LIST CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
                Tidak ada tagihan aktif atau pesanan siap ambil.
            </div>
        )}

        {filteredData.map(trx => {
            const isLunas = trx.remaining_balance <= 0;
            const isReady = trx.order_status === 'Ready';

            return (
                <div key={trx.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative overflow-hidden">
                    
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${isReady ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {trx.order_status}
                    </div>

                    <div className="mb-4 pr-12">
                        <h3 className="font-bold text-lg text-gray-800">{trx.customers?.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{trx.invoice_number}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-bold">Rp {trx.total_amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Sudah Bayar:</span>
                            <span className="text-green-600 font-bold">Rp {trx.total_paid.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between">
                            <span className="text-gray-700 font-bold">Sisa Tagihan:</span>
                            <span className={`font-bold ${isLunas ? 'text-green-500' : 'text-red-500'}`}>
                                Rp {trx.remaining_balance.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isLunas && (
                            <button 
                                onClick={() => { setSelectedTrx(trx); setPayAmount(''); }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                            >
                                <Wallet size={16}/> Bayar
                            </button>
                        )}

                        {isLunas && isReady && (
                            <button 
                                onClick={() => handleHandover(trx)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                            >
                                <Package size={16}/> Serahkan
                            </button>
                        )}

                        {isLunas && !isReady && (
                            <div className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1">
                                <Clock size={14}/> Menunggu Produksi
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* MODAL PEMBAYARAN */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up relative">
                <button 
                    onClick={() => setSelectedTrx(null)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-1">Input Pembayaran</h3>
                <p className="text-sm text-gray-500 mb-4">{selectedTrx.invoice_number}</p>
                
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100">
                    <p className="text-xs uppercase font-bold tracking-wide mb-1">SISA TAGIHAN</p>
                    <p className="text-3xl font-black">Rp {selectedTrx.remaining_balance.toLocaleString('id-ID')}</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                    
                    {/* INPUT NOMINAL DENGAN FORMAT RUPIAH */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nominal Bayar</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-bold">Rp</span>
                            <input 
                                type="text" 
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-bold text-xl text-right text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={payAmount}
                                onChange={handleAmountChange} // Menggunakan helper format
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Metode</label>
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('Cash')}
                                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition ${paymentMethod === 'Cash' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                Tunai
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('Transfer')}
                                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition ${paymentMethod === 'Transfer' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                Transfer
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6 pt-2">
                        <button type="button" onClick={() => setSelectedTrx(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Batal</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">Proses Bayar</button>
                    </div>
                </form>
             </div>
        </div>
      )}

    </div>
  );
};

export default PaymentPage;