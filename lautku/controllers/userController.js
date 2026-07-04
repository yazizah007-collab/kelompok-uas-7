const userModel = require('../models/userModel');

exports.getAll = async (req, res) => {
  try {
    const users = await userModel.findAll();
    const data = users.map(({ password, ...u }) => u);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    const { password, ...data } = user;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nama, no_hp, alamat } = req.body;
    await userModel.update(req.params.id, { nama, no_hp, alamat });
    res.json({ message: 'Profil berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await userModel.delete(req.params.id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.suspend = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    const newStatus = user.status === 'aktif' ? 'suspend' : 'aktif';
    await userModel.suspend(req.params.id, newStatus);
    res.json({ message: `Akun berhasil di${newStatus === 'suspend' ? 'suspend' : 'aktifkan'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};