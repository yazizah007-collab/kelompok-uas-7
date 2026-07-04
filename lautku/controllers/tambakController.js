const tambakModel = require('../models/tambakModel');
const panenModel = require('../models/panenModel');
const pengeluaranModel = require('../models/pengeluaranModel');

exports.getAll = async (req, res) => {
  try {
    const tambak = await tambakModel.findByNelayan(req.user.id);
    res.json(tambak);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const tambak = await tambakModel.findById(req.params.id);
    if (!tambak) return res.status(404).json({ message: 'Tambak tidak ditemukan' });
    if (tambak.nelayan_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    res.json(tambak);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama_tambak, lokasi, luas, jenis_budidaya } = req.body;
    const id = await tambakModel.create({
      nelayan_id: req.user.id,
      nama_tambak,
      lokasi,
      luas: parseFloat(luas),
      jenis_budidaya
    });
    res.status(201).json({ message: 'Tambak berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const tambak = await tambakModel.findById(req.params.id);
    if (!tambak) return res.status(404).json({ message: 'Tambak tidak ditemukan' });
    if (tambak.nelayan_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    const { nama_tambak, lokasi, luas, jenis_budidaya } = req.body;
    await tambakModel.update(req.params.id, { nama_tambak, lokasi, luas: parseFloat(luas), jenis_budidaya });
    res.json({ message: 'Tambak berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const tambak = await tambakModel.findById(req.params.id);
    if (!tambak) return res.status(404).json({ message: 'Tambak tidak ditemukan' });
    if (tambak.nelayan_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    await tambakModel.delete(req.params.id);
    res.json({ message: 'Tambak berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPanen = async (req, res) => {
  try {
    const panen = await panenModel.findByTambak(req.params.id);
    res.json(panen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPanen = async (req, res) => {
  try {
    const { tanggal_tebar, tanggal_panen_rencana, jumlah_tebar, catatan } = req.body;
    const id = await panenModel.create({
      tambak_id: req.params.id,
      tanggal_tebar,
      tanggal_panen_rencana,
      tanggal_panen_aktual: null,
      jumlah_tebar: parseInt(jumlah_tebar),
      hasil_panen: null,
      catatan: catatan || null
    });
    res.status(201).json({ message: 'Siklus panen berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePanen = async (req, res) => {
  try {
    const panen = await panenModel.findById(req.params.id);
    if (!panen) return res.status(404).json({ message: 'Siklus panen tidak ditemukan' });
    const { tanggal_panen_aktual, hasil_panen, status, catatan } = req.body;
    await panenModel.update(req.params.id, {
      tanggal_panen_aktual: tanggal_panen_aktual || null,
      hasil_panen: hasil_panen ? parseFloat(hasil_panen) : null,
      status,
      catatan: catatan || null
    });
    res.json({ message: 'Siklus panen berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPengeluaran = async (req, res) => {
  try {
    const pengeluaran = await pengeluaranModel.findByTambak(req.params.id);
    res.json(pengeluaran);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPengeluaran = async (req, res) => {
  try {
    const { kategori, jumlah, keterangan, tanggal, siklus_id } = req.body;
    const id = await pengeluaranModel.create({
      tambak_id: req.params.id,
      siklus_id: siklus_id || null,
      kategori,
      jumlah: parseFloat(jumlah),
      keterangan: keterangan || null,
      tanggal
    });
    res.status(201).json({ message: 'Pengeluaran berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePengeluaran = async (req, res) => {
  try {
    const pengeluaran = await pengeluaranModel.findById(req.params.id);
    if (!pengeluaran) return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' });
    const { kategori, jumlah, keterangan, tanggal, siklus_id } = req.body;
    await pengeluaranModel.update(req.params.id, {
      kategori,
      jumlah: parseFloat(jumlah),
      keterangan: keterangan || null,
      tanggal,
      siklus_id: siklus_id || null
    });
    res.json({ message: 'Pengeluaran berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePengeluaran = async (req, res) => {
  try {
    await pengeluaranModel.delete(req.params.id);
    res.json({ message: 'Pengeluaran berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLaporan = async (req, res) => {
  try {
    const { dari, sampai } = req.query;
    const panen = await panenModel.findByTambak(req.params.id);
    const pengeluaran = await pengeluaranModel.findByPeriode(req.params.id, dari, sampai);
    const total_pengeluaran = pengeluaran.reduce((sum, p) => sum + p.jumlah, 0);
    const total_panen = panen
      .filter(p => p.status === 'selesai')
      .reduce((sum, p) => sum + (p.hasil_panen || 0), 0);
    res.json({ panen, pengeluaran, total_panen, total_pengeluaran });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};