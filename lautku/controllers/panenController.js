const panenModel = require('../models/panenModel');

const panenController = {
  getByTambak: async (req, res) => {
    try {
      const { tambak_id } = req.params;
      const data = await panenModel.findByTambak(tambak_id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await panenModel.findById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Data panen tidak ditemukan' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { tambak_id, tanggal_tebar, tanggal_panen_rencana, jumlah_tebar, catatan } = req.body;
      const id = await panenModel.create({
        tambak_id,
        tanggal_tebar,
        tanggal_panen_rencana,
        tanggal_panen_aktual: null,
        jumlah_tebar: parseInt(jumlah_tebar),
        hasil_panen: null,
        catatan: catatan || null
      });
      res.status(201).json({ message: 'Data panen berhasil ditambahkan', id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await panenModel.findById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Data panen tidak ditemukan' });

      const { tanggal_panen_aktual, hasil_panen, status, catatan } = req.body;
      await panenModel.update(req.params.id, {
        tanggal_panen_aktual: tanggal_panen_aktual || null,
        hasil_panen: hasil_panen ? parseFloat(hasil_panen) : null,
        status,
        catatan: catatan || null
      });
      res.json({ message: 'Data panen berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      const data = await panenModel.findById(req.params.id);
      if (!data) return res.status(404).json({ message: 'Data panen tidak ditemukan' });

      await panenModel.delete(req.params.id);
      res.json({ message: 'Data panen berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = panenController;