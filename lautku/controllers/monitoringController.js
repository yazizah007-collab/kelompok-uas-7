const monitoringModel = require('../models/monitoringModel');

exports.getByTambak = async (req, res) => {
  try {
    const data = await monitoringModel.findByTambak(req.params.tambak_id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { tambak_id, ph, suhu, salinitas, oksigen, kecerahan, catatan } = req.body;
    const id = await monitoringModel.create({
      tambak_id,
      ph: parseFloat(ph),
      suhu: parseFloat(suhu),
      salinitas: parseFloat(salinitas),
      oksigen: parseFloat(oksigen),
      kecerahan: parseFloat(kecerahan),
      catatan: catatan || null
    });
    res.status(201).json({ message: 'Data monitoring berhasil ditambahkan', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await monitoringModel.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data monitoring tidak ditemukan' });
    await monitoringModel.delete(req.params.id);
    res.json({ message: 'Data monitoring berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};