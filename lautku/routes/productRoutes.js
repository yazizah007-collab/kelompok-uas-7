const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Kategori
router.get('/kategori', productController.getAllKategori);
router.post('/kategori', auth, role('admin'), productController.createKategori);
router.delete('/kategori/:id', auth, role('admin'), productController.deleteKategori);

// Produk
router.get('/', productController.getAll);
router.get('/milik-saya', auth, role('nelayan'), productController.getByNelayan);
router.get('/:id', productController.getById);
router.post('/', auth, role('nelayan'), productController.create);
router.put('/:id', auth, role('nelayan', 'admin'), productController.update);
router.delete('/:id', auth, role('nelayan', 'admin'), productController.delete);

module.exports = router;