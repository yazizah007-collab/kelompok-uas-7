const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', artikelController.getAll);
router.get('/admin', auth, role('admin'), artikelController.getAllAdmin);
router.get('/:id', artikelController.getById);
router.post('/', auth, role('admin'), artikelController.create);
router.put('/:id', auth, role('admin'), artikelController.update);
router.delete('/:id', auth, role('admin'), artikelController.delete);

module.exports = router;