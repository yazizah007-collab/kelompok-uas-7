const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = await userModel.create({
      nama,
      email,
      password: hash,
      role: role || 'pembeli',
      foto: null,
      no_hp: null,
      alamat: null
    });

    res.status(201).json({ message: 'Registrasi berhasil', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    if (user.status === 'suspend') {
      return res.status(403).json({ message: 'Akun kamu disuspend' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        foto: user.foto
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    const { password, ...data } = user;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email dan password baru wajib diisi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await userModel.update(user.id, { password: hash });

    res.json({ message: 'Password berhasil diubah, silakan login dengan password baru' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};