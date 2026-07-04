const keranjangModel = require('../models/keranjangModel');
const orderModel = require('../models/orderModel');
const orderDetailModel = require('../models/orderDetailModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');

// Status order yang masih boleh dibatalkan oleh pembeli.
// Begitu status sudah 'dikirim' atau 'selesai', pembatalan tidak diizinkan lagi.
const CANCELABLE_STATUSES = ['pending', 'dikonfirmasi'];

// Helper: ambil data user dengan cache sederhana supaya tidak query berulang
// untuk pembeli/nelayan yang sama di dalam satu request.
const buildUserCache = () => {
  const cache = {};
  return async (id) => {
    if (!id) return null;
    if (cache[id] !== undefined) return cache[id];
    const u = await userModel.findById(id).catch(() => null);
    cache[id] = u;
    return u;
  };
};

// Helper: lengkapi daftar order dengan nama pembeli, daftar produk yang dibeli,
// dan nama nelayan pemilik produk. Dipakai untuk tampilan admin & nelayan
// supaya "Order Terbaru" tidak lagi menampilkan generic 'Produk' / 'Rp 0'.
const enrichOrders = async (orders) => {
  const getUser = buildUserCache();

  return Promise.all(orders.map(async (order) => {
    const details = await orderDetailModel.findByOrder(order.id);
    const pembeli = await getUser(order.pembeli_id);

    const items = await Promise.all(details.map(async (d) => {
      const nelayan = await getUser(d.nelayan_id);
      return {
        produk_id: d.produk_id,
        nama_produk: d.nama_produk,
        jumlah: d.jumlah,
        harga_satuan: d.harga_satuan,
        subtotal: d.subtotal,
        nelayan_id: d.nelayan_id,
        nelayan_nama: nelayan?.nama || nelayan?.name || null
      };
    }));

    const namaProdukGabungan = items.map(i => i.nama_produk).filter(Boolean).join(', ') || 'Produk';
    const namaNelayanUnik = [...new Set(items.map(i => i.nelayan_nama).filter(Boolean))].join(', ');

    return {
      ...order,
      // total_harga sudah tersimpan di dokumen order sejak checkout,
      // tapi kita pastikan selalu ada angkanya (fallback hitung ulang dari items)
      total_harga: order.total_harga ?? items.reduce((sum, i) => sum + (i.subtotal || 0), 0),
      pembeli_nama: pembeli?.nama || pembeli?.name || 'Pembeli',
      pembeli_email: pembeli?.email || null,
      items,
      nama_produk: namaProdukGabungan,
      nelayan_nama: namaNelayanUnik || null
    };
  }));
};

exports.getKeranjang = async (req, res) => {
  try {
    const items = await keranjangModel.findByPembeli(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToKeranjang = async (req, res) => {
  try {
    const { produk_id, jumlah } = req.body;
    const produk = await productModel.findById(produk_id);
    if (!produk) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (produk.status === 'habis') return res.status(400).json({ message: 'Produk habis' });

    const existing = await keranjangModel.findItem(req.user.id, produk_id);
    if (existing) {
      await keranjangModel.update(existing.id, { jumlah: existing.jumlah + parseInt(jumlah) });
      return res.json({ message: 'Jumlah produk diupdate' });
    }

    const id = await keranjangModel.create({
      pembeli_id: req.user.id,
      produk_id,
      jumlah: parseInt(jumlah),
      nama_produk: produk.nama_produk,
      harga: produk.harga,
      gambar: produk.gambar,
      satuan: produk.satuan,
      stok: produk.stok,
      nelayan_id: produk.nelayan_id
    });
    res.status(201).json({ message: 'Produk ditambahkan ke keranjang', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateKeranjang = async (req, res) => {
  try {
    const item = await keranjangModel.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });
    if (item.pembeli_id !== req.user.id) return res.status(403).json({ message: 'Akses ditolak' });
    await keranjangModel.update(req.params.id, { jumlah: parseInt(req.body.jumlah) });
    res.json({ message: 'Keranjang berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteKeranjang = async (req, res) => {
  try {
    const item = await keranjangModel.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });
    if (item.pembeli_id !== req.user.id) return res.status(403).json({ message: 'Akses ditolak' });
    await keranjangModel.delete(req.params.id);
    res.json({ message: 'Item dihapus dari keranjang' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { alamat_pengiriman, catatan } = req.body;
    const items = await keranjangModel.findByPembeli(req.user.id);
    if (items.length === 0) return res.status(400).json({ message: 'Keranjang kosong' });

    const total_harga = items.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

    const order_id = await orderModel.create({
      pembeli_id: req.user.id,
      total_harga,
      alamat_pengiriman,
      catatan: catatan || null
    });

    const details = items.map(item => ({
      order_id,
      produk_id: item.produk_id,
      nelayan_id: item.nelayan_id || null,
      nama_produk: item.nama_produk,
      jumlah: item.jumlah,
      harga_satuan: item.harga,
      subtotal: item.harga * item.jumlah
    }));

    await orderDetailModel.createBatch(details);
    await keranjangModel.deleteByPembeli(req.user.id);

    res.status(201).json({ message: 'Checkout berhasil', order_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await orderModel.findAll();
      orders = await enrichOrders(orders);
    } else if (req.user.role === 'nelayan') {
      orders = await orderModel.findByNelayan(req.user.id);
      orders = await enrichOrders(orders);
    } else {
      orders = await orderModel.findByPembeli(req.user.id);
    }

    // Urutkan dari yang terbaru berdasarkan createdAt
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    // Pembeli hanya boleh melihat order miliknya sendiri
    if (req.user.role === 'pembeli' && order.pembeli_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const rawDetails = await orderDetailModel.findByOrder(req.params.id);

    // Lengkapi setiap item dengan nama penjual (nelayan)
    const getUser = buildUserCache();
    const details = await Promise.all(rawDetails.map(async (d) => {
      const nelayan = await getUser(d.nelayan_id);
      return {
        ...d,
        nelayan_nama: nelayan?.nama || nelayan?.name || null
      };
    }));

    let pembeli_nama = null;
    let pembeli_email = null;
    if (req.user.role === 'admin' || req.user.role === 'nelayan') {
      const pembeli = await userModel.findById(order.pembeli_id).catch(() => null);
      pembeli_nama = pembeli?.nama || pembeli?.name || null;
      pembeli_email = pembeli?.email || null;
    }

    res.json({ ...order, details, pembeli_nama, pembeli_email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    await orderModel.update(req.params.id, { status: req.body.status });
    res.json({ message: 'Status order berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pembatalan pesanan oleh pembeli.
// Hanya pemilik order yang bisa membatalkan, dan hanya selama status
// masih 'pending' atau 'dikonfirmasi' (belum dikirim).
exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    if (order.pembeli_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const statusSaatIni = (order.status || '').toLowerCase();
    if (!CANCELABLE_STATUSES.includes(statusSaatIni)) {
      return res.status(400).json({
        message: 'Pesanan tidak bisa dibatalkan karena sudah dikirim/selesai/dibatalkan'
      });
    }

    await orderModel.update(req.params.id, { status: 'dibatalkan' });
    res.json({ message: 'Pesanan berhasil dibatalkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};