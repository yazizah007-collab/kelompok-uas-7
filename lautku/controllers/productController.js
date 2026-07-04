const productModel = require('../models/productModel');
const kategoriModel = require('../models/kategoriModel');
const userModel = require('../models/userModel');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.kategori_id) filter.kategori_id = req.query.kategori_id;
    if (req.query.status) filter.status = req.query.status;
    let produk = await productModel.findAll(filter);
    if (req.query.search) {
      const keyword = req.query.search.toLowerCase();
      produk = produk.filter(p => p.nama_produk.toLowerCase().includes(keyword));
    }
    res.json(produk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const produk = await productModel.findById(req.params.id);
    if (!produk) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    // Lengkapi data produk dengan info nelayan yang memposting,
    // supaya halaman Detail Produk bisa menampilkan "Dijual oleh".
    let nelayan = null;
    if (produk.nelayan_id) {
      const n = await userModel.findById(produk.nelayan_id).catch(() => null);
      if (n) {
        nelayan = {
          id: n.id,
          nama: n.nama || n.name || 'Nelayan',
          lokasi: n.lokasi || n.alamat || null,
          email: n.email || null
        };
      }
    }

    res.json({ ...produk, nelayan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByNelayan = async (req, res) => {
  try {
    const produk = await productModel.findByNelayan(req.user.id);
    res.json(produk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, stok, satuan, kategori_id, gambar } = req.body;
    const id = await productModel.create({
      nelayan_id: req.user.id,
      nama_produk,
      deskripsi: deskripsi || null,
      harga: parseFloat(harga),
      stok: parseInt(stok),
      satuan,
      kategori_id,
      gambar: gambar || null,
      status: 'tersedia'
    });
    res.status(201).json({ message: 'Produk berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const produk = await productModel.findById(req.params.id);
    if (!produk) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (produk.nelayan_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    const { nama_produk, deskripsi, harga, stok, satuan, kategori_id, status, gambar } = req.body;
    await productModel.update(req.params.id, {
      nama_produk,
      deskripsi: deskripsi || null,
      harga: parseFloat(harga),
      stok: parseInt(stok),
      satuan,
      kategori_id,
      status: status || produk.status,
      gambar: gambar || produk.gambar || null
    });
    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const produk = await productModel.findById(req.params.id);
    if (!produk) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (produk.nelayan_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    await productModel.delete(req.params.id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllKategori = async (req, res) => {
  try {
    const kategori = await kategoriModel.findAll();
    res.json(kategori);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createKategori = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const id = await kategoriModel.create({ nama_kategori, deskripsi });
    res.status(201).json({ message: 'Kategori berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteKategori = async (req, res) => {
  try {
    await kategoriModel.delete(req.params.id);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
