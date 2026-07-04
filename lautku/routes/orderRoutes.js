const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Keranjang
router.get('/keranjang', auth, role('pembeli'), orderController.getKeranjang);
router.post('/keranjang', auth, role('pembeli'), orderController.addToKeranjang);
router.put('/keranjang/:id', auth, role('pembeli'), orderController.updateKeranjang);
router.delete('/keranjang/:id', auth, role('pembeli'), orderController.deleteKeranjang);

// Order
router.post('/checkout', auth, role('pembeli'), orderController.checkout);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, role('nelayan', 'admin'), orderController.updateStatus);
router.put('/:id/cancel', auth, role('pembeli'), orderController.cancelOrder);

module.exports = router;
