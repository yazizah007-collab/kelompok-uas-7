const artikelModel = require('../models/artikelModel');

exports.getAll = async (req, res) => {
  try {
    const artikel = await artikelModel.findAll('publish');
    res.json(artikel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const artikel = await artikelModel.findAll();
    res.json(artikel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const artikel = await artikelModel.findById(req.params.id);
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.json(artikel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { judul, konten, kategori, status, gambar } = req.body;
    const id = await artikelModel.create({
      admin_id: req.user.id,
      judul,
      konten,
      kategori: kategori || null,
      status: status || 'draft',
      gambar: gambar || null
    });
    res.status(201).json({ message: 'Artikel berhasil dibuat', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const artikel = await artikelModel.findById(req.params.id);
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    const { judul, konten, kategori, status, gambar } = req.body;
    await artikelModel.update(req.params.id, { judul, konten, kategori, status, gambar });
    res.json({ message: 'Artikel berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const artikel = await artikelModel.findById(req.params.id);
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    await artikelModel.delete(req.params.id);
    res.json({ message: 'Artikel berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};